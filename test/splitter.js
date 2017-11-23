const Splitter = artifacts.require("./Splitter.sol");
const expectedExceptionPromise = require("../expected_exception_testRPC_and_geth.js");
const PromisifyWeb3 = require("./promisifyWeb3.js");
PromisifyWeb3.promisify(web3);

contract('Splitter', accounts => {
    let instance;
    let owner = accounts[0] ;
    let Bob = accounts[1];
    let Carol = accounts[2];

	beforeEach(() => {
	    return Splitter.new(Bob, Carol,{ from: owner }
        ).then(_instance => {
	        instance = _instance;
	    })
	});

	it("should be owned by owner", async() => {
		_owner = await instance.owner(
        );
		assert.strictEqual(_owner, owner, "Contract is not owned by owner");
	});

	it("should add a new deposit to the contract balance", () => {
        let deposit= 10;
        let expected = "10";
        let event = "LogDeposit";
        let contractBalanceBefore;
        let contractBalanceAfter;
        return web3.eth.getBalancePromise(instance.address)
        .then(_balance  => {
            contractBalanceBefore = _balance;
            return instance.deposit({from: owner, value: deposit})  
	    }).then(txObj => {
            assert.strictEqual(txObj.logs[0].event, event, "a deposit was not logged");
            return web3.eth.getBalancePromise(instance.address)
        }).then(_balance  => {
            contractBalanceAfter = _balance;
            assert.strictEqual(_balance.toString(10), expected, "Splitter balance was not increased by 10 wei");
        })
	});

    
    it("should properly manage the state of 'theChosenOnes'", async() => {
        let deposit = 10;
        let bobsFundsBefore;
        let bobsFundsAfter;
        let carolsFundsBefore;
        let carolsFundsAfter;
        return Promise.all([
            instance.theChosenOnes(Bob, {from: owner}),
            instance.theChosenOnes(Carol, {from: owner}),
        ])
            .then(values => {
                bobsFundsBefore = values[0];
                carolsFundsBefore = values[1];
                return instance.deposit({from: owner, value: deposit})
            })
            .then(txObj => {
                return Promise.all([
                    instance.theChosenOnes(Bob, {from: owner}),
                    instance.theChosenOnes(Carol, {from: owner})
                ])
            })
            .then(funds => {
                bobsFundsAfter = funds[0];
                carolsFundsAfter = funds[1];
                let deltaBob = bobsFundsAfter.minus(bobsFundsBefore).toString(10);
                let deltaCarol = carolsFundsAfter.minus(carolsFundsBefore).toString(10);
                let halfDeposit = (deposit / 2).toString(10);
                assert.strictEqual(deltaBob, halfDeposit, "Bob wasn't properly credited");
                assert.strictEqual(deltaCarol, halfDeposit, "Carol wasn't properly credited");
            })
    })

    it("should properly manage the state of 'theChosenOnes'", async() => {
        let deposit = 10;
        let bobsFundsBefore;
        let bobsFundsAfter;
        let carolsFundsBefore;
        let carolsFundsAfter;
        bobsFundsBefore = await instance.theChosenOnes(0, {from: Bob})
        carolsFundsBefore = await instance.theChosenOnes(0, {from: Carol})
        await instance.deposit({from: owner, value: 10});  
        bobsFundsAfter = await instance.theChosenOnes(Bob, {from: owner})
        carolsFundsAfter = await instance.theChosenOnes(Carol, {from: owner});
        let deltaBob = bobsFundsAfter.minus(bobsFundsBefore).toString(10);
        let deltaCarol = carolsFundsAfter.minus(carolsFundsBefore).toString(10);
        let halfDeposit = (deposit / 2).toString(10);
        assert.strictEqual(deltaBob, halfDeposit, "Bob wasn't properly credited");
        assert.strictEqual(deltaCarol, halfDeposit, "Carol wasn't properly credited");
    })

    it("should keep track of the total value of all deposits", () => {
        Promise.all([
            instance.deposit({from: owner, value: 2}
        ),  instance.deposit({from: owner, value: 14}),
            instance.deposit({from: owner, value: 14})
        ]).then(() => {
            return web3.eth.getBalancePromise(instance.address)
        }).then(_balance => {
            assert.strictEqual(_balance.toString(10), "30", "Splitter balance was not properly credited")
        })
    })

    it("should keep track of the total value of all deposits", async() => {
        await instance.deposit({from: owner, value: 2}
        );
        await instance.deposit({from: owner, value: 14})
        await instance.deposit({from: owner, value: 14})
        .then (() => {
            return web3.eth.getBalancePromise(instance.address)
        }).then(_balance => {
            assert.strictEqual(_balance.toString(10), "30", "Splitter balance was not properly credited")
        })
    })

    it("should let owner freeze all key functions", async() => {
        await instance.freeze(true, {from: owner});
        _frozen = await instance.frozen.call();
        assert.strictEqual(_frozen.toString(10), "true", "the freezeRay is not working!");
        return expectedExceptionPromise(() => {
                return instance.withdrawFunds({from: Carol})
            }) 
    })

	it("should not be possible for Bob to make a deposit", () => {
        expectedExceptionPromise(() => {
            return instance.deposit({ from: bob, value: 10});
        });
    });


    it("should confirm that carol can withdraw her funds", async() => {
        let startBalance;
        let payout;
        let gasPrice;
        let gasUsed;
        let txFee;
        let endBalance;
        let testAmount = 8000000000000000;
        startBalance = await web3.eth.getBalancePromise(Carol);
        await instance.deposit({from: owner, value: testAmount}); 
        txObj = await instance.withdrawFunds({from: Carol});
        payout = txObj.logs[0].args.amount
        gasUsed = txObj.receipt.gasUsed;
        tx = await web3.eth.getTransactionPromise(txObj.tx);
        gasPrice = tx.gasPrice;
        txFee = gasPrice.times(gasUsed);
        endBalance = await web3.eth.getBalancePromise(Carol)
        _funds = await instance.theChosenOnes.call(0, {from: Carol});
        assert.strictEqual(_funds.toString(10), "0", "players funds should have been set to 0");
        assert.strictEqual(startBalance.plus(payout).minus(txFee).toString(10), endBalance.toString(10), "Carol didn't get her ether")  
    })
});

