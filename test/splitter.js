const Splitter = artifacts.require("./Splitter.sol");
const expectedExceptionPromise = require("../expected_exception_testRPC_and_geth.js");
// const Promise = require("bluebird");
const PromisifyWeb3 = require("./promisifyWeb3.js");
PromisifyWeb3.promisify(web3);


contract('Splitter', accounts => {
    let instance;
    let owner = accounts[0] ;
    let Bob = accounts[1];
    let Carol = accounts[2];

	beforeEach(() => {
	return Splitter.new(Bob, Carol,{ from: owner }).then(_instance => {
	  instance = _instance;
	})
	});

	it("should be owned by owner", () => {
		return instance.owner().then(_owner => {
		  	assert.strictEqual(_owner, owner, "Contract is not owned by owner");
		});
	});

	// it("should add a new deposit to the contract balance", () => {
	// 	 return instance.deposit({from: owner, value: 10}).then(txObj => {
	// 	  	assert.strictEqual(txObj.logs[0].event, "LogDeposit", "a deposit was not logged");
	// 	    return web3.eth.getBalance(instance.address)
	//     }).then((_balance) => {
	// 	      assert.strictEqual(_balance.toString(10), "10", "Splitter balance was not increased by 10 wei")
	// 	});
	// });

	it("should keep track of the total value of all deposits", () => {
		return instance.deposit({from: owner, value: 2}).then (() => {
		    return instance.deposit({from: owner, value: 14})
		}).then(txObj => {
		    return instance.deposit({from: owner, value: 14})
		}).then (() => {
		    return web3.eth.getBalance(instance.address)
		}).then(_balance => {
		    assert.strictEqual(_balance.toString(10), "30", "Splitter balance was not properly credited")
		})
	})

	it("should allow Bob to withdraw 25 wei", () => {
		  return instance.deposit({from: owner, value: 50}).then(() => {
		      return web3.eth.getBalance(instance.address)
		  }).then(_balance => {
	      return instance.withdrawFunds({from: Bob})
	  }).then(txObj => {
	  	  assert.strictEqual(txObj.logs[0].event, "LogWithdrawal", "a deposit was not logged");
	      assert.strictEqual(txObj.logs[0].args.amount.toString(10), "25", "Bob's share wasn't properly allocated");
	  });
	});

	it("should allow Carol to withdraw 11 wei", () => {
		  return instance.deposit({from: owner, value: 21}).then(() => {
		      return web3.eth.getBalance(instance.address)
		  }).then(() => {
	      return instance.withdrawFunds({from: Carol})
	  }).then(txObj => {
	      assert.strictEqual(txObj.logs[0].args.amount.toString(10), "11", "Carols's share wasn't properly allocated");
	  });
	});

    it("should let owner freeze all key functions", () => {
        return instance.freeze(true, {from: owner}).then(() => {
        	return instance.frozen()
        }).then(_frozen => {
        	assert.strictEqual(_frozen.toString(10), "true", "the freezeRay is not working!");
        	return expectedExceptionPromise(() => {
                return instance.withdrawFunds({from: Carol})
        	}) 
        })
	})

	it("should not be possible for Bob to make a deposit", function () {
        return expectedExceptionPromise(() => {
            return instance.deposit({ from: Bob, value: 10});
        });
    });

	it("should confirm that carol actually received her funds", () => {
		let startBalance;
		let payout;
		let gasPrice;
	    let gasUsed;
	    let txFee;
	    let endBalance;
		web3.eth.getBalancePromise(Carol).then(_balance => {
            startBalance = _balance;
            return instance.deposit({from: owner, value: 8000000000000000})
		}).then(() => {  
	        return instance.withdrawFunds({from: Carol})
	    }).then(txObj => {
            payout = txObj.logs[0].args.amount
            gasUsed = txObj.receipt.gasUsed;
            return web3.eth.getTransactionPromise(txObj.tx)
        }).then(tx => {
            gasPrice = tx.gasPrice;
            txFee = gasPrice.times(gasUsed);
            return web3.eth.getBalancePromise(Carol
        )}).then(_balance => {
            endBalance = _balance;
            assert.equal(startBalance.plus(payout).minus(txFee).toString(10), endBalance.toString(10), "Carol didn't get her ether")
            if(error) console.log("error: " + error);  
		})
    });
})

  //   it("should confirm that the Owner can withdraw all the funds", () => {
		// let startBalance;
		// let payout;
		// let gasPrice;
	 //    let gasUsed;
	 //    let txFee;
	 //    let endBalance;
		// startBalance = web3.eth.getBalance(owner);
	 //    return instance.deposit({from: owner, value: 1000000000000000000}).then(() => {  
	 //        return instance.withdrawFunds({from: owner})
	 //    }).then(txObj => {
  //           payout = txObj.logs[0].args.amount
  //           gasUsed = txObj.receipt.gasUsed;
  //           web3.eth.getTransaction(txObj.tx, (err, tx) => {
  //               gasPrice = tx.gasPrice;
  //               txFee = gasPrice.times(gasUsed);
  //               endBalance = web3.eth.getBalance(
  //               owner);
  //               assert.strictEqual(startBalance.plus(payout).minus(txFee).toString(10), endBalance.toString(10), "owner didn't get their ether");
  //           });               
        
	 //    });
  //   });

