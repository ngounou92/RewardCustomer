'use strict';

const { Gateway, Wallets} = require('fabric-network');
const FabricCAServices=require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

// capture network variables from config.json


function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

     
module.exports = {
  
     registerCustomer: async function registerCustomer (cardId, accountNumber, firstName, lastName, email, phoneNumber) 
     {

        // Create a new file system based wallet for managing identities.
        try {
        	
        const ccpPath = path.resolve(__dirname,'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
         // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('cardId');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: cardId,
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: cardId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(cardId, x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');

        //  } catch (err) {
        //     //print and return error
        //     console.log(err);
        //     let error = {};
        //     error.error = err.message;
        //     return error;
        // }

        // await sleep(2000);

        // try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled :true,asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            let customer = {};
            customer.accountNumber = accountNumber;
            customer.firstName = firstName;
            customer.lastName = lastName;
            customer.email = email;
            customer.phoneNumber = phoneNumber;
            customer.points = 0;

            // Submit the specified transaction.
            console.log('\nSubmit Create Member transaction.');
            const createMemberResponse = await contract.submitTransaction('CreateCustomer', JSON.stringify(customer));
            console.log('createMemberResponse: ');
            console.log(JSON.parse(createMemberResponse.toString()));

            console.log('\nGet member state ');
            const memberResponse = await contract.evaluateTransaction('GetState', accountNumber);
            console.log('memberResponse.parse_response: ');
            console.log(JSON.parse(memberResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
    registerCompany: async function registerCompany (cardId, companyId, name) {

        // Create a new file system based wallet for managing identities.
        

        try {
        const ccpPath = path.resolve(__dirname,'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
         // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('cardId');
        if (userIdentity) {
            console.log('An identity for the user ${cardId} already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: cardId,
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: cardId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(cardId, x509Identity);
        console.log('Successfully registered and enrolled admin user "${cardId}" and imported it into the wallet');

        //  } catch (err) {
        //     //print and return error
        //     console.log(err);
        //     let error = {};
        //     error.error = err.message;
        //     return error;
        // }


        // try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            let company = {};
            company.id = companyId;
            company.name = name;

            // Submit the specified transaction.
            console.log('\nSubmit Create Partner transaction.');
            const createPartnerResponse = await contract.submitTransaction('CreateCompany', JSON.stringify(company));
            console.log('createPartnerResponse: ');
            console.log(JSON.parse(createPartnerResponse.toString()));

            console.log('\nGet partner state ');
            const partnerResponse = await contract.evaluateTransaction('GetState', companyId);
            console.log('partnerResponse.parse_response: ');
            console.log(JSON.parse(partnerResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform EarnPoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} partnerId Partner Id of partner
  * @param {Integer} points Points value

  */

    
    
    earnPointsTransaction: async function (cardId, accountNumber, partnerId, points) {

        // Create a new file system based wallet for managing identities.
        
        try {

        const ccpPath = path.resolve(__dirname, 'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true }});

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            let earnPoints = {};
            earnPoints.points = points;
            earnPoints.member = accountNumber;
            earnPoints.partner = partnerId;

            // Submit the specified transaction.
            console.log('\nSubmit EarnPoints transaction.');
            const earnPointsResponse = await contract.submitTransaction('EarnPoints', JSON.stringify(earnPoints));
            console.log('earnPointsResponse: ');
            console.log(JSON.parse(earnPointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform UsePoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} partnerId Partner Id of partner
  * @param {Integer} points Points value
  */
    usePointsTransaction: async function (cardId, accountNumber, partnerId, points) {

        // Create a new file system based wallet for managing identities.
       
        try {
        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            let usePoints = {};
            usePoints.points = points;
            usePoints.member = accountNumber;
            usePoints.partner = partnerId;

            // Submit the specified transaction.
            console.log('\nSubmit UsePoints transaction.');
            const usePointsResponse = await contract.submitTransaction('UsePoints', JSON.stringify(usePoints));
            console.log('usePointsResponse: ');
            console.log(JSON.parse(usePointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
    memberData: async function (cardId, accountNumber) {

        try {
        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            console.log('\nGet member state ');
            let member = await contract.submitTransaction('GetState', accountNumber);
            member = JSON.parse(member.toString());
            console.log(member);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return member;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Partner data
  * @param {String} cardId Card id to connect to network
  * @param {String} partnerId Partner Id of partner
  */
    partnerData: async function (cardId, partnerId) {

        // Create a new file system based wallet for managing identities.
        

        try {

        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user '+cardId+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
	      }
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true }});

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            let partner = await contract.submitTransaction('GetState', partnerId);
            partner = JSON.parse(partner.toString());
            console.log(partner);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return partner;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
    allPartnersInfo : async function (cardId) {

        // Create a new file system based wallet for managing identities.
        
        try {

        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user '+cardId+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            console.log('\nGet all partners state ');
            let allPartners = await contract.evaluateTransaction('GetState', 'all-partners');
            allPartners = JSON.parse(allPartners.toString());
            console.log(allPartners);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return allPartners;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
    },

    /*
  * Get all EarnPoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    earnPointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
        

        try {

        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user '+cardId+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: {enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            console.log(`\nGet earn points transactions state for ${userType} ${userId}`);
            let earnPointsTransactions = await contract.evaluateTransaction('EarnPointsTransactionsInfo', userType, userId);
            earnPointsTransactions = JSON.parse(earnPointsTransactions.toString());
            console.log(earnPointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return earnPointsTransactions;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all UsePoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    usePointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
       

        try {

        const ccpPath = path.resolve(__dirname,'connection.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(cardId);
        if (!identity) {
            console.log('An identity for the user'+cardId+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
	            }
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery:{enabled: true, asLocalhost:true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('ngounou');

            console.log(`\nGet use points transactions state for ${userType} ${userId}`);
            let usePointsTransactions = await contract.evaluateTransaction('UsePointsTransactionsInfo', userType, userId);
            usePointsTransactions = JSON.parse(usePointsTransactions.toString());
            console.log(usePointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return usePointsTransactions;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    }
   };
