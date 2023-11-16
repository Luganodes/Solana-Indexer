<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://gitlab.com/luganodes/open-source-internal/solana-indexer">
    <img src="./images/logo.png" alt="Solana Indexer Logo"  height="75">
  </a>

  <h3 align="center">Solana Indexer</h3>

  <p align="center">
    A fast, efficient, and open-source Solana blockchain indexer designed to query, analyze, and monitor on-chain data.
    <br />
    <a href="#readme-top"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://gitlab.com/luganodes/open-source-internal/solana-indexer/-/issues">Report Bug</a>
    ·
    <a href="https://gitlab.com/luganodes/open-source-internal/solana-indexer/-/issues">Request Feature</a>
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables-description">Environment Variables Description</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a>
      <ul>
        <li><a href="#local-run">Local Run</a></li>
        <li><a href="#docker-run">Docker Run</a></li>
      </ul>
    </li>
    <li><a href="#schema-definition">Schema Definition</a>
      <ul>
        <li><a href="#delegator-schema">Delegator Schema</a></li>
        <li><a href="#reward-schema">Reward Schema</a></li>
        <li><a href="#transaction-schema">Transaction Schema</a></li>
      </ul>
    </li>
    <li><a href="#how-it-works">How It Works?</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

[![Banner](./images/banner.png)](https://gitlab.com/luganodes/open-source-internal/solana-indexer)

Introducing our open-source Solana Indexer - a robust and scalable solution designed to help you effortlessly navigate the ever-growing Solana blockchain. Built with performance and usability in mind, our indexer rapidly fetches, processes, and stores on-chain data, making it instantly queryable for analytics, monitoring, or other applications. Whether you're a developer looking to integrate Solana data into your app, an enterprise in need of a reliable data backend, or simply a blockchain enthusiast wanting insights, our Solana Indexer is the tool you've been waiting for. Get started now and unlock the full potential of blockchain data.

There are 3 crons setup:

1. Delegator Cron (runs every 30 minutes)
2. Rewards Cron (runs once every day at 1:00 am)
3. Validator Rewards Cron (runs everyday at 1:00 am)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

- [![MongoDB](https://img.shields.io/badge/mongoDB-00684a?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
- [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en)
- [![Docker](https://img.shields.io/badge/Docker-1D63ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

#### Node.js

Node.js is required to run the Solana Indexer. Follow the installation guide for your platform [here](https://nodejs.org/en/download/package-manager).

#### npm

npm comes bundled with Node.js, but you can ensure you have the latest version by running the following command:

```sh
npm install npm@latest -g
```

#### Docker (Optional)

Docker is optional but recommended for containerized deployment. Follow the installation guide for your platform here.

- For macOS: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
- For Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
- For Linux: [Docker for Linux](https://docs.docker.com/engine/install/)

### Installation

1. Clone the repo
   ```sh
   git clone https://gitlab.com/luganodes/open-source-internal/solana-indexer.git
   ```

2. Change into the directory
    ```sh
    cd solana-indexer
    ```

3. Install NPM packages (not required for Docker Run)
   ```sh
   npm i
   ```   

3. **Environment Variables**
    ```sh
    touch .env
    ```
    **For running this project successfully you'll need to create a `.env` file like [`.env.sample`](https://gitlab.com/luganodes/open-source-internal/solana-indexer/-/blob/main/.env.sample?ref_type=heads).**

### Environment Variables Description

#### `DB_URI`
- **Description:**  
  Holds the connection string URI for the database, specifying the location of the database.
- **Format:**  
  ```
  mongodb://<dbhost>:<dbport>
  ```
- **Example:**  
  ```env
  DB_URI=mongodb://localhost:27017
  ```

#### `DB_NAME`
- **Description:**  
  Holds the databse name
- **Example:**  
  ```env
  DB_NAME=solana_indexer
  ```

#### `MONGO_USER`
- **Description:**  
  Holds the username used to authenticate with the MongoDB database.
- **Example:**  
  ```env
  MONGO_USER=myuser
  ```

#### `MONGO_PASSWORD`
- **Description:**  
  Holds the password corresponding to `MONGO_USER`, used to authenticate with the MongoDB database.
- **Example:**  
  ```env
  MONGO_PASSWORD=mypassword
  ```

#### `VALIDATOR_PUB_KEY`
- **Description:**  
  Stores the public key of the validator, that's responsible for verifying and validating new transactions and adding them to the blockchain.
- **Example:**  
  ```env
  VALIDATOR_PUB_KEY=6aow5rTURdbhbeMDrFrbP2GR5vZjMEhktEy87iH1VGPs
  ```

#### `VALIDATOR_ID`
- **Description:**  
  Holds a unique identifier for the validator, allowing users or systems to reference a specific validator within the network or protocol.
- **Assigned Value:**  
  ```env
  VALIDATOR_ID=LGNS
  ```

#### `START_EPOCH`
- **Description:**  
  Represents the epoch at which the validator began validating blocks and distributing delegation rewards.
- **Example:**  
  ```env
  START_EPOCH=357
  ```


### Notes
- Store sensitive information like `MONGO_PASSWORD` securely, and avoid unnecessary exposure.
- Do not hardcode environment variables directly in the code; use configuration files, environment files, or secure vaults.
- Restart your application or system after changing environment variable values for the changes to take effect.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Local Run
```sh
- npm start (for normal run)
- npm run dev (for development run)
- npm run format (to format your code)
- npm run jsdoc (to generate documentation)
```

### Docker Run
To start the Docker container
```sh
docker-compose up --build
```
To stop the Docker container
```sh
docker-compose down
```
 
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Schema Definition

### Delegator Schema

### Delegator Schema

| Field               | Type    | Required | Default | Description                                        |
|---------------------|---------|----------|---------|----------------------------------------------------|
| `delegatorId`       | String  | Yes      | -       | Public key for the delegator                       |
| `timestamp`         | Number  | Yes      | -       | Unix timestamp for when the delegator was created  |
| `unstaked`          | Boolean | No       | `false` | Indicates if the amount is unstaked                |
| `unstakedTimestamp` | Number  | No       | `-1`    | Unix timestamp for when the amount was unstaked    |
| `unstakedEpoch`     | Number  | No       | `-1`    | Epoch when the unstaking occurred                  |
| `apr`               | Number  | No       | `0`     | APR for the delegator                              |
| `stakedAmount`      | Number  | No       | `0`     | The amount that is staked                          |
| `activationEpoch`   | Number  | No       | `0`     | Epoch when the staking was activated               |

### Reward Schema

### Reward Schema

| Field              | Type    | Required | Default | Description                                        |
|--------------------|---------|----------|---------|----------------------------------------------------|
| `delegatorId`      | String  | Yes      | -       | Public key of the delegator                        |
| `solUsd`           | Number  | No       | `0`     | Current price of Solana in USD                     |
| `epochNum`         | Number  | Yes      | -       | Epoch number for this reward                       |
| `timestamp`        | Number  | Yes      | -       | Timestamp of the reward                            |
| `postBalance`      | Number  | Yes      | -       | Post-reward balance                                |
| `postBalanceUsd`   | Number  | No       | `0`     | Post-reward balance in USD                         |
| `userAction`       | String  | No       | -       | Type of user action (`WITHDRAW`, `REWARD`)        |
| `reward`           | Number  | Yes      | -       | Reward amount                                      |
| `rewardUsd`        | Number  | Yes      | -       | Reward amount in USD                               |
| `totalReward`      | Number  | Yes      | -       | Total rewards till the current epoch              |
| `totalRewardUsd`   | Number  | No       | `0`     | Total rewards in USD till the current epoch        |
| `pendingRewards`   | Number  | Yes      | -       | Pending rewards                                    |
| `pendingRewardsUsd`| Number  | No       | `0`     | Pending rewards in USD                             |
| `stakedAmount`     | Number  | Yes      | -       | The initial staked amount                          |
| `stakedAmountUsd`  | Number  | Yes      | -       | The initial staked amount in USD                   |

### Transaction Schema

### Transaction Schema

| Field              | Type    | Required | Default | Description                                        |
|--------------------|---------|----------|---------|----------------------------------------------------|
| `delegatorId`      | String  | Yes      | -       | Public key of the delegator                        |
| `timestamp`        | Number  | Yes      | -       | Timestamp of the transaction                       |
| `type`             | String  | Yes      | -       | Transaction type (e.g., `STAKE`, `UNSTAKE`)        |
| `amount`           | Number  | Yes      | -       | Amount involved in the transaction                 |
| `solUsd`           | Number  | Yes      | -       | Price of Solana in USD at the time of transaction  |
| `transactionCount` | Number  | Yes      | -       | Transaction count for the delegator                |
| `transactionHash`  | String  | Yes      | -       | Hash of the transaction                            |
| `fee`              | Number  | Yes      | -       | Transaction fee                                    |

## How it works?

The rewards are calulated from the start epoch, as we loop through each entry in our MongoDB to fetch the rewards of delegators for the specific epoch

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Make some amazing changes.
4. `git add .`
4. Commit your Changes (`git commit -m "<Verb>: <Action>"`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

To start contributing, check out [`CONTRIBUTING.md`](https://gitlab.com/luganodes/open-source-internal/solana-indexer/-/blob/main/CONTRIBUTING.md?ref_type=heads) . New contributors are always welcome to support this project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](https://gitlab.com/luganodes/open-source-internal/solana-indexer/-/blob/main/LICENSE?ref_type=heads) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Luganodes - [@luganodes](https://twitter.com/luganodes) - email@example.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>