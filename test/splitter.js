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
            instance.theChosenOnes.call(0, {from: Bob}),
            instance.theChosenOnes.call(0, {from: Carol}),
        ])
            .then(values => {
                console.log("values: " + values);
                bobsFundsBefore = values[0];
                carolsFundsBefore = values[1];
                console.log("bob before: " + bobsFundsBefore.toString(10));
                return instance.deposit({from: owner, value: deposit})
            })
            .then(txObj => {
                console.log(txObj.logs[0].args);
                return Promise.all([
                    instance.theChosenOnes.call(0, {from: Bob}),
                    instance.theChosenOnes.call(0, {from: Carol})
                ])
            })
            .then(funds => {
                console.log("funds: " + funds);
                bobsFundsAfter = funds[0];
                carolsFundsAfter = funds[1];
                console.log(bobsFundsAfter.toString(10));
                let deltaBob = bobsFundsAfter.minus(bobsFundsBefore).toString(10);
                let deltaCarol = carolsFundsAfter.minus(carolsFundsBefore).toString(10);
                let halfDeposit = (deposit / 2).toString(10);
                assert.strictEqual(deltaBob, halfDeposit, "Bob wasn't properly credited");
                assert.strictEqual(deltaCarol, halfDeposit, "Carol wasn't properly credited");
            })
    })



// *
    // it("should properly manage the state of 'theChosenOnes'", async() => {
    //     let deposit = 10;
    //     let bobsFundsBefore;
    //     let bobsFundsAfter;
    //     let carolsFundsBefore;
    //     let carolsFundsAfter;
    //     bobsFundsBefore = await instance.theChosenOnes.call(0, {from: Bob})
    //     console.log(bobsFundsBefore);
    //     carolsFundsBefore = await instance.theChosenOnes.call(0, {from: Carol})
    //     await instance.deposit({from: owner, value: 10}); 
    //     console.log(await instance.deposit({from: owner, value: deposit})); 
    //     bobsFundsAfter = await instance.theChosenOnes.call(0, {from: Bob})
    //     carolsFundsAfter = await instance.theChosenOnes.call(0, {from: Carol});
    //     console.log(bobsFundsAfter);
    //     setTimeout(function(){
    //         console.log(bobsFundsAfter);
    //     });
    //     let deltaBob = bobsFundsAfter.minus(bobsFundsBefore).toString(10);
    //     let deltaCarol = carolsFundsAfter.minus(carolsFundsBefore).toString(10);
    //     let halfDeposit = (deposit / 2).toString(10);
    //     assert.strictEqual(deltaBob, halfDeposit, "Bob wasn't properly credited");
    //     assert.strictEqual(deltaCarol, halfDeposit, "Carol wasn't properly credited");
    // })

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


	// it("should confirm that carol can withdraw her funds", () => {
	// 	let startBalance;
	// 	let payout;
	// 	let gasPrice;
	//     let gasUsed;
	//     let txFee;
	//     let endBalance;
 //        let testAmount = 8000000000000000;
	// 	return web3.eth.getBalancePromise(Carol)
 //        .then(_balance => {
 //            startBalance = _balance;
 //            return instance.deposit({from: owner, value: testAmount})
	// 	}).then(() => {  
	//         return instance.withdrawFunds({from: Carol})
	//     }).then(txObj => {
 //            payout = txObj.logs[0].args.amount
 //            gasUsed = txObj.receipt.gasUsed;
 //            return web3.eth.getTransactionPromise(txObj.tx)
 //        }).then(tx => {
 //            gasPrice = tx.gasPrice;
 //            txFee = gasPrice.times(gasUsed);
 //            return web3.eth.getBalancePromise(Carol
 //        )}).then(_balance => {
 //            endBalance = _balance;
 //            return instance.theChosenOnes.call(0, {from: Carol})
 //        }).then(_funds => {
 //            assert.strictEqual(_funds.toString(10), "0", "players funds should have been set to 0");
 //            assert.strictEqual(startBalance.plus(payout).minus(txFee).toString(10), endBalance.toString(10), "Carol didn't get her ether")  
 //        })
 //    });

// failing, as I have no function for owner to withdraqw ATM.
  //   it("should confirm that the Owner can withdraw all the funds", () => {
		// let startBalance;
		// let payout;
		// let gasPrice;
	 //    let gasUsed;
	 //    let txFee;
	 //    let endBalance;
  //       let testAmount = 1000000000000000000;
		// return web3.eth.getBalancePromise(owner)
  //       .then(_balance => {
  //           startBalance = _balance;
  //           instance.deposit({from: owner, value: testAmount})
  //       }).then(() => {  
	 //        return instance.withdrawFunds({from: owner})
	 //    }).then(txObj => {
  //           payout = txObj.logs[0].args.amount
  //           gasUsed = txObj.receipt.gasUsed;
  //           return web3.eth.getTransactionPromise(txObj.tx)
  //       }).then(tx => {
  //           gasPrice = tx.gasPrice;
  //           txFee = gasPrice.times(gasUsed);
  //           return web3.eth.getBalancePromise(owner)
  //       }).then(_balance => {
  //           endBalance = _balance;
  //           assert.equal(startBalance.plus(payout).minus(txFee).toString(10), endBalance.toString(10), "owner didn't get their ether");
  //       }) 
  //   });
});

