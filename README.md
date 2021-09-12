# RewardCustomer



 

Customer Reward Application


Customer reward Application is an application based on a Customer loyalty Program developed by IBM. 
By using hyperledger fabric samples we have developed this application locally. We have included two organizations where each organization has one peer. We have also added some functions in our smart contract so that the network participants will have more action on the network. Following are the main to deploy this network locally.

We have supposed that any user interested by this project has already installed the required software  such docker ,docker-compose,Node.js,  ... 
and the fabric samples v2.2.


Steps
1.clone the repo 
2.setup the network 
3.install the smart contract 
4.run the application 


1.clone the repo 

clone the repository in your choosing folder.

git clone https://github.com/ngounou92/Customer-Reward-Application.git
cd Customer-Reward-Application

2.setup the network
cd artifacts/certificate

step up the certificate authority for the various organizations

./certificate.sh

 set up the network artifacts.
 
cd ./../channel/create-artifacts.sh
set up the various docker container 

cd ../

docker-compose up -d

deploy the channel 

cd ../

./createChannel.sh

step 3 install the smart contract

./javasm.sh

step 4 

cd web-app 

node enrollAdmin.js

node registerUser.js

node app.js 

The application will be running on localhost port 3000 as we have in the following screenshot. For more information you can reach me out at(ngounoubernard@hotmail.com)  






