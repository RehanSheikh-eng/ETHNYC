from brownie import Lottery, Timer, VRFConsumer, config, network
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
    fund_with_link,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS
)
from ...tests.conftest import (
    SIZE_OF_LOTTERY,
    MAX_VALID_NUMBER, 
    FEE,
    ORIGIN_TIME,
    VALID_PRIZE_DISTRIBUTION
)

def deploy_lottery():

    account = get_account()
    print(f"On network {network.show_active()}")

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        timer = Timer.deploy({"from": account})
        assert timer is not None
        timer_address = timer.address

    else:
        timer_address = "0x0"

    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer_address,
        {"from": account})

    keyhash = config["networks"][network.show_active()]["keyhash"]
    fee = config["networks"][network.show_active()]["fee"]
    vrf_coordinator = get_contract("vrf_coordinator")
    link_token = get_contract("link_token")

    print(f"Lottery Contract Deployed at:{lottery.address}")

    vrf_contract = VRFConsumer.deploy(
        keyhash,
        vrf_coordinator,
        link_token,
        lottery.address,
        fee,
        {"from": account},
        publish_source=get_verify_status(),
    )

    fund_with_link(
        vrf_contract,
        amount=config["networks"][network.show_active()]["fee"]
    )

    lottery.initialize(
        vrf_contract.address,
        {"from": get_account()})

def start_and_enter_lottery():

    account = get_account()
    lottery = Lottery[-1]
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})
    tx = lottery.startLottery(
            ORIGIN_TIME,
            ORIGIN_TIME+100,
            VALID_PRIZE_DISTRIBUTION,
            {"from": account})

    for i in range(10):
        randnums= np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
        lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})

def main():
    deploy_lottery()
    start_and_enter_lottery()