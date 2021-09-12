'use strict';

const { Contract } = require('fabric-contract-api');
const allPartnersKey = 'all-partners';
const earnPointsTransactionsKey = 'earn-points-transactions';
const usePointsTransactionsKey = 'use-points-transactions';

class CustomerLoyalty extends Contract {

    //this function has to be executed before start using the application.
    async initLedger(ctx) {
        console.info('Initialize the ledger');

        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify([])));

        console.info('ledger Initialize successfully');
    }

          //Add a new customer on the ledger
    async CreateCustomer(ctx, customer) {
          customer = JSON.parse(customer);

        await ctx.stub.putState(customer.accountNumber, Buffer.from(JSON.stringify(customer)));

        return JSON.stringify(customer);
    }

    // Add a new company on the ledger, and add it to the all-partners list
    async CreateCompany(ctx, company) {
        company = JSON.parse(company);

        await ctx.stub.putState(company.id, Buffer.from(JSON.stringify(company)));

        let allPartners = await ctx.stub.getState(allPartnersKey);
        allPartners = JSON.parse(allPartners);
        allPartners.push(company);
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify(allPartners)));

        return JSON.stringify(company);
    }

    // Record a transaction a transaction where a customer earns some points.
    async EarnPoints(ctx, earnPoints) {
        earnPoints = JSON.parse(earnPoints);
        earnPoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low*1000)).toGMTString();
        earnPoints.transactionId = ctx.stub.txId;

        let member = await ctx.stub.getState(earnPoints.member);
        member = JSON.parse(member);
        member.points += earnPoints.points;
        await ctx.stub.putState(earnPoints.member, Buffer.from(JSON.stringify(member)));

        let earnPointsTransactions = await ctx.stub.getState(earnPointsTransactionsKey);
        earnPointsTransactions = JSON.parse(earnPointsTransactions);
        earnPointsTransactions.push(earnPoints);
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify(earnPointsTransactions)));

        return JSON.stringify(earnPoints);
    }

    // Record a transaction where a customer use some its points to redeem a given item.
    async UsePoints(ctx, usePoints) {
        usePoints = JSON.parse(usePoints);
        usePoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low*1000)).toGMTString();
        usePoints.transactionId = ctx.stub.txId;

        let member = await ctx.stub.getState(usePoints.member);
        member = JSON.parse(member);
        if (member.points < usePoints.points) {
            throw new Error('customer does not have sufficient points');
        }
        member.points -= usePoints.points;
        await ctx.stub.putState(usePoints.member, Buffer.from(JSON.stringify(member)));

        let usePointsTransactions = await ctx.stub.getState(usePointsTransactionsKey);
        usePointsTransactions = JSON.parse(usePointsTransactions);
        usePointsTransactions.push(usePoints);
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify(usePointsTransactions)));

        return JSON.stringify(usePoints);
    }

    // Get earn points transactions of the particular customer or company
    async EarnPointsTransactionsInfo(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(earnPointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'customer') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'company') {
                if (transaction.partner === userId) {
                    userTransactions.push(transaction);
                }
            }
        }

        return JSON.stringify(userTransactions);
    }

    // Get use points transactions of the particular company or customer
    async UsePointsTransactionsInfo(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(usePointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'customer') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'company') {
                if (transaction.partner === userId) {
                    userTransactions.push(transaction);
                }
            }
        }

        return JSON.stringify(userTransactions);
    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);

        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

}

module.exports = CustomerLoyalty;