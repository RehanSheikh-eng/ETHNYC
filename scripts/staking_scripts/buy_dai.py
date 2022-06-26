from brownie import Staking, APIConsumer, Timer, config, network, ZERO_ADDRESS, Contract
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


def uniswap_dai_exchange():
    return Contract.from_explorer("0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667")

def buy_dai():
    account = get_account()
    uniswap = uniswap_dai_exchange()
    uniswap.ethToTokenSwapInput(
        1,  # minimum amount of tokens to purchase
        9999999999,  # timestamp
        {
            "from": account,
            "value": "10 ether"
        }
    )
    dai = get_contract("dai")
    print(dai.balance({"from": account}))

def stake_dai():
    account = get_account()
    staking = Staking[-1]
    dai = get_contract("dai")
    amount = dai.balance({"from": account})
    tx = staking.stake(amount, {"from": account})

def main():
    buy_dai()
    stake_dai()