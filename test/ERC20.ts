import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe("homework80", () => {
    async function deploy() {
        const name = "TestToken";
        const symbol = "TTK";
        const decimals = 18;
        const oneToken = BigNumber.from(10).pow(decimals);
        const [owner, user1, hacker, user2] = await ethers.getSigners();
        const ERC20 = await ethers.getContractFactory("ERC20");
        const erc20 = await ERC20.deploy(name, symbol, decimals);
        await erc20.deployed();
        return { erc20, name, symbol, decimals, oneToken, owner, user1, hacker, user2 };
    }

    describe("Deployment", () => {
        it("Check name", async () => {
            const { erc20, name } = await loadFixture(deploy);
            expect(name).to.equal(await erc20.name());
        })
        it("Check symbol", async () => {
            const { erc20, symbol } = await loadFixture(deploy);
            expect(symbol).to.equal(await erc20.symbol());
        })
        it("Check decimals", async () => {
            const { erc20, decimals } = await loadFixture(deploy);
            expect(decimals).to.equal(await erc20.decimals());
        })
        it("Check totalSupply", async () => {
            const { erc20 } = await loadFixture(deploy);
            expect(0).to.equal(await erc20.totalSupply());
        })
    })

    describe("Test function mint", () => {
        describe("Requires", () => {
            it("Check owner", async () => {
                const { erc20, hacker, oneToken } = await loadFixture(deploy);
                await expect(erc20.connect(hacker).mint(hacker.address, oneToken))
                .to.revertedWith("ERC20: You are not owner!");
            })
        })
        describe("Interaction", () => {
            it("Check change to balance", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                await expect(erc20.mint(user1.address, oneToken))
                .to.changeTokenBalance(erc20, user1.address, oneToken);
                
            })
            it("Check change to totalSupply", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                const totalSupply = await erc20.totalSupply();
                const tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                expect(BigNumber.from(totalSupply).add(oneToken))
                .to.equal(await erc20.totalSupply());
            })
        })
        describe("Events", () => {
            it("Check Transfer event", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                await expect(erc20.mint(user1.address, oneToken))
                .to.emit(erc20, "Transfer")
                .withArgs(ethers.constants.AddressZero, user1.address, oneToken);
            })
        })
    })

    describe("Test function burn", () => {
        describe("Requires", () => {
            it("Check enough tokens", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                const tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).burn(oneToken.add(1)))
                .to.revertedWith("ERC20: Not enough tokens!");
            })
        })
        describe("Interaction", () => {
            it("Check change to balance", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                const tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).burn(oneToken))
                .to.changeTokenBalance(erc20, user1.address, oneToken.mul(-1));
                
            })
            it("Check change to totalSupply", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                let tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                const totalSupply = await erc20.totalSupply();
                tx = await erc20.connect(user1).burn(oneToken);
                await tx.wait();
                expect(BigNumber.from(totalSupply).sub(oneToken))
                .to.equal(await erc20.totalSupply());
            })
        })
        describe("Events", () => {
            it("Check Transfer event", async () => {
                const { erc20, user1, oneToken } = await loadFixture(deploy);
                let tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).burn(oneToken))
                .to.emit(erc20, "Transfer")
                .withArgs(user1.address, ethers.constants.AddressZero, oneToken);
            })
        })
    })

    describe("Test function transfer", () => {
        describe("Requires", () => {
            it("Check enough tokens", async () => {
                const { erc20, user1, hacker } = await loadFixture(deploy);
                const hackerBalance = await erc20.balanceOf(hacker.address);
                await expect(erc20.connect(hacker).transfer(user1.address, hackerBalance.add(1)))
                .to.revertedWith("ERC20: Not enough tokens!");
            })
        })
        describe("Interaction", () => {
            it("Check change balances", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                let tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).transfer(user2.address, oneToken))
                .to.changeTokenBalances(
                    erc20,
                    [user1.address, user2.address],
                    [oneToken.mul(-1), oneToken]
                )
            })
        })
        describe("Events", () => {
            it("Check Transfer event", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                let tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).transfer(user2.address, oneToken))
                .to.emit(erc20, "Transfer")
                .withArgs(user1.address, user2.address, oneToken);
            })
        })
    })

    describe("Test function approve", () => {
        describe("Interaction", () => {
            it("Check change allowed", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                const allowed = await erc20.allowance(user1.address, user2.address);
                let tx = await erc20.connect(user1).approve(user2.address, oneToken);
                await tx.wait();
                expect(allowed.add(oneToken))
                .to.equal(await erc20.allowance(user1.address, user2.address));
            })
        })
        describe("Events", () => {
            it("Check Approval event", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                await expect(erc20.connect(user1).approve(user2.address, oneToken))
                .to.emit(erc20, "Approval")
                .withArgs(user1.address, user2.address, oneToken);
            })
        })
    })

    describe("Test function increaseAllowance", () => {
        describe("Interaction", () => {
            it("Check change allowed", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                const allowed = await erc20.allowance(user1.address, user2.address);
                const tx = await erc20.connect(user1).increaseAllowance(user2.address, oneToken);
                await tx.wait();
                expect(allowed.add(oneToken))
                .to.equal(await erc20.allowance(user1.address, user2.address));
            })
        })
        describe("Events", () => {
            it("Check Approval event", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                const allowed = await erc20.allowance(user1.address, user2.address);
                await expect(erc20.connect(user1).increaseAllowance(user2.address, oneToken))
                .to.emit(erc20, "Approval")
                .withArgs(user1.address, user2.address, allowed.add(oneToken));
            })
        })
    })

    describe("Test function decreaseAllowance", () => {
        describe("Interaction", () => {
            it("Check change allowed", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                let tx = await erc20.connect(user1).approve(user2.address, oneToken);
                await tx.wait();
                const allowed = await erc20.allowance(user1.address, user2.address);
                tx = await erc20.connect(user1).decreaseAllowance(user2.address, oneToken);
                await tx.wait();
                expect(allowed.sub(oneToken))
                .to.equal(await erc20.allowance(user1.address, user2.address));
            })
        })
        describe("Events", () => {
            it("Check Approval event", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                let tx = await erc20.connect(user1).approve(user2.address, oneToken);
                await tx.wait();
                const allowed = await erc20.allowance(user1.address, user2.address);
                await expect(erc20.connect(user1).decreaseAllowance(user2.address, oneToken))
                .to.emit(erc20, "Approval")
                .withArgs(user1.address, user2.address, allowed.sub(oneToken));
            })
        })
    })

    describe("Test function transferFrom", () => {
        describe("Requires", () => {
            it("Check enough tokens", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                const tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.transferFrom(user1.address, user2.address, oneToken.add(1)))
                .to.revertedWith("ERC20: Not enough tokens!");
            })
            it("Check enough allowed", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                await expect(erc20.transferFrom(user1.address, user2.address, oneToken.add(1)))
                .to.revertedWith("ERC20: Not enough allowed!");
            })
        })
        describe("Interaction", () => {
            it("Check change balances", async () => {
                const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                let tx = await erc20.mint(user1.address, oneToken);
                await tx.wait();
                await expect(erc20.connect(user1).transfer(user2.address, oneToken))
                .to.changeTokenBalances(
                    erc20,
                    [user1.address, user2.address],
                    [oneToken.mul(-1), oneToken]
                )
            })
            it("Check change allowed", async () => {
                // const { erc20, user1, oneToken } = await loadFixture(deploy);
                // const tx = await erc20.mint(user1.address, oneToken);
                // await tx.wait();
                // await expect(erc20.connect(user1).burn(oneToken.add(1)))
                // .to.revertedWith("ERC20: Not enough tokens!");
            })
        })
        describe("Events", () => {
            it("Check Transfer event", async () => {
                // const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                // let tx = await erc20.mint(user1.address, oneToken);
                // await tx.wait();
                // await expect(erc20.connect(user1).transfer(user2.address, oneToken))
                // .to.emit(erc20, "Transfer")
                // .withArgs(user1.address, user2.address, oneToken);
            })
            it("Check Approval event", async () => {
                // const { erc20, user1, user2, oneToken } = await loadFixture(deploy);
                // await expect(erc20.connect(user1).approve(user2.address, oneToken))
                // .to.emit(erc20, "Approval")
                // .withArgs(user1.address, user2.address, oneToken);
            })
        })
    })
})