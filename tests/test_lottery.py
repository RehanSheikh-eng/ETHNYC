import time
import pytest
from brownie import Lottery, VRFConsumer, Timer, convert, network, reverts
from scripts.helpful_scripts import(
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

from conftest import (
    SIZE_OF_LOTTERY,
    MAX_VALID_NUMBER, 
    FEE
)

VALID_PRIZE_DISTRIBUTION = [50, 20, 10, 10, 5, 5]
ORIGIN_TIME = 5



@pytest.mark.parametrize(
    "starting_time,closing_time,STATE",
    [(ORIGIN_TIME, ORIGIN_TIME+100, 1),
     (ORIGIN_TIME+100, ORIGIN_TIME+200, 0)])
def test_valid_start_lottery_local(
    deploy_all_contracts,
    starting_time,
    closing_time,
    STATE):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})

    # Act
    tx = lottery.startLottery(
        starting_time,
        closing_time,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})
    
    # Assert
    lotto_ID = lottery.lottoId({"from": account})
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})

    assert lotto_info[0] == lotto_ID 
    assert len(lotto_info[1]) == SIZE_OF_LOTTERY
    assert sum(lotto_info[1]) == 0 
    assert lotto_info[2] == STATE 
    assert lotto_info[3] == VALID_PRIZE_DISTRIBUTION 
    assert lotto_info[4] == starting_time 
    assert lotto_info[5] == closing_time
    assert isinstance(tx.txid, str)

@pytest.mark.parametrize(
    "starting_time,closing_time,prize_distribution",
    [(100, 50, VALID_PRIZE_DISTRIBUTION),
    (0, 100, VALID_PRIZE_DISTRIBUTION),
    (ORIGIN_TIME, ORIGIN_TIME+100, [1]),
    (ORIGIN_TIME, ORIGIN_TIME+100, [5, 5, 5, 5, 5, 5])])
def test_revert_start_lottery_local(
    deploy_all_contracts,
    starting_time,
    closing_time,
    prize_distribution):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    _, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})
    OTHER_ACCOUNT = get_account(1)

    # Act
    with reverts():
        tx = lottery.startLottery(
            starting_time,
            closing_time,
            prize_distribution,
            {"from": account})

    with reverts():
        tx = lottery.startLottery(
            ORIGIN_TIME,
            ORIGIN_TIME+100,
            [5, 5, 5, 5, 5, 5],
            {"from": OTHER_ACCOUNT})
      
def test_valid_draw_numbers_local(deploy_all_contracts):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    vrf_consumer, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})
    tx1 = lottery.startLottery(
        ORIGIN_TIME,
        ORIGIN_TIME+100,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})

    assert isinstance(tx1.txid, str)
    lotto_ID = lottery.lottoId({"from": account})
    
    lottery.setCurrentTime(ORIGIN_TIME+105, {"from": account})

    # Act
    tx2 = lottery.drawNumbers({"from": account})
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})
    assert lotto_info[2] == 2
    tx2.wait(1)

    request_id = tx2.events["RequestNumbers"]["requestId"]
    assert isinstance(request_id, convert.datatypes.HexString)

    tx3 = get_contract("vrf_coordinator").callBackWithRandomness(
        request_id,
        777,
        vrf_consumer.address,
        {"from": get_account()})
    assert tx3 is not None
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})

    # Assert
    assert lotto_info[2] == 3