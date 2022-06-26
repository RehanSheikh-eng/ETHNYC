from brownie import Staking, APIConsumer, Timer, config, network, ZERO_ADDRESS
from brownie.network import account
import time
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
    fund_with_link,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS
)

def deploy_staking_mumbai():
    account = get_account()
    print(f"On network {network.show_active()}")
    
    
    dai = get_contract("dai")
    aDai = get_contract("aDai")
    lendingPool = get_contract("lendingPool")

    staking = Staking.deploy(dai, aDai, lendingPool, {"from": account})

    oracle = get_contract("oracle")
    jobId = config["networks"][network.show_active()]["jobId"]
    fee = config["networks"][network.show_active()]["fee"]
    link_token = get_contract("link_token")

    api_consumer = APIConsumer.deploy(oracle, jobId, fee, link_token, staking.address, {"from": account})

    tx = staking.initialize(
        api_consumer.address,
        {"from": account}
    )
    tx.wait(1)


def main():
    deploy_staking_mumbai()
