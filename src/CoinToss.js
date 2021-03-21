import React, { Component } from 'react';
import { RangeStepInput } from 'react-range-step-input';
import Modal from 'react-modal';
import Coin from './Coin';
import './CoinToss.css';
import heads from './heads.png';
import tails from './tails.png';

class CoinToss extends Component {
    static defaultProps = {
        coinFace: [heads, tails],
    }


    constructor(props) {
        super(props);
        this.state = {
            flipAnimaiton: false,
            frontFace: this.randomCoinFace(),
            backFace: this.randomCoinFace(),
            flips: 0,
            heads: 0,
            tails: 0,
            bet: 1,
            total: 100,
            message: '',
            showModal: false

        }
        this.randomCoinFace = this.randomCoinFace.bind(this);
        this.tossHead = this.tossHead.bind(this);
        this.tossTail = this.tossTail.bind(this);
        this.reset = this.reset.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }



    async handleOpenModal() {

        await new Promise(r => setTimeout(r, 2000));
        var resultMessage = '';
        console.log(this.state.total);
        if (this.state.total > 100) {
            resultMessage = 'Congras you win more than you lose: you total is $' + parseInt(this.state.total) + '.';
        }
        else if (this.state.total < 1) {
            resultMessage = 'You are broke !! you have $' + parseInt(this.state.total) + '.';
        } else {
            resultMessage = 'Tough luck you lose some money, you have $' + parseInt(this.state.total) + + 'left.';
        }
        this.setState({
            showModal: true,
            message: resultMessage,
        });
        this.reset();

    }

    handleCloseModal() {
        this.setState({ showModal: false });
    }


    randomCoinFace() {
        return this.props.coinFace[Math.random() < 0.6 ? 0 : 1];
    }

    tossHead() {
        if (this.state.flips < 10) {
            this.toss(true);
        }
    }

    tossTail() {
        if (this.state.flips < 10) {
            this.toss(false);
        }
    }

    toss(isHead) {

        this.setState({ flipAnimaiton: true });

        const changeFace = this.randomCoinFace();
        console.log(changeFace);
        console.log("count " + this.state.flips);

        setTimeout(() => {
            var result = this.state.total + 0
            if (isHead) {
                if (changeFace === heads) {
                    result = parseInt(this.state.total) + parseInt(this.state.bet);
                } else {
                    result = parseInt(this.state.total) - parseInt(this.state.bet);
                }
            }
            else {
                if (changeFace === tails) {
                    result = parseInt(this.state.total) + parseInt(this.state.bet);
                } else {
                    result = parseInt(this.state.total) - parseInt(this.state.bet);
                }
            }
            if (result <= 0) {
                this.handleOpenModal();
            }
            this.setState(st => ({
                frontFace: changeFace === heads ? this.props.coinFace[0] : this.props.coinFace[1],
                backFace: changeFace === tails ? this.props.coinFace[1] : this.props.coinFace[0],
                heads: changeFace === heads ? st.heads + 1 : st.heads + 0,
                tails: changeFace === tails ? st.tails + 1 : st.tails + 0,
                flips: st.flips + 1,
                total: result,
            }))
        }, 50)

        setTimeout(() => {
            this.setState({ flipAnimaiton: false });
        }, 500);


        if (this.state.flips >= 9) {
            this.handleOpenModal();
        }
    }

    reset() {

        setTimeout(() => {
            this.setState(st => ({
                heads: 0,
                tails: 0,
                flips: 0,
                bet: 1,
                total: 100,
            }))
        }, 100)


    }

    onChange(e) {

        this.setState({ bet: e.target.value });
    }

    render() {


        let flipCoinInner = 'flip-coin-inner';

        if (this.state.flipAnimaiton === true) {
            flipCoinInner += ' flip-animation'
        }

        return (
            <div className="CoinToss">
                <h2 style={{ color: 'CadetBlue' }}>Coin Toss</h2>
                <h4 style={{ color: 'OrangeRed' }} >Given a way to practice risk management as chances of landing on head are 60%, you have 10 tries to win as much as you can.</h4>
                <div className='flip-coin'>
                    <div className={flipCoinInner}>
                        <div className='flip-coin-front'>
                            <Coin face={this.state.frontFace} />
                        </div>
                        <div className='flip-coin-back'>
                            <Coin face={this.state.backFace} />
                        </div>
                    </div>
                </div>

                <p></p>
                <h2 style={{ color: 'CadetBlue' }}>Bet Amount: ${this.state.bet}</h2>
                <div>
                    <RangeStepInput
                        min={1} max={100}
                        value={this.state.bet} step={1}
                        onChange={this.onChange.bind(this)}

                    />
                </div>
                <button disabled={this.state.flipAnimaiton} onClick={this.tossHead}>
                    {this.state.flipAnimaiton === false ? 'HEAD' : 'Flipping...'}
                </button>
                <button disabled={this.state.flipAnimaiton} onClick={this.tossTail}>
                    {this.state.flipAnimaiton === false ? 'TAIL' : 'Flipping...'}
                </button>
                <div>
                    <Modal
                        isOpen={this.state.showModal}
                        contentLabel="Finish"
                    >
                        <h3 style={{ color: 'SteelBlue' }}> {this.state.message}</h3>
                        <p></p>
                        <p></p>
                        <button onClick={this.handleCloseModal}>Close Me</button>
                    </Modal>
                </div>

                <button onClick={this.reset}>Reset</button>
                <h2 style={{ color: 'OrangeRed' }}>Your Wallet: ${this.state.total}</h2>
                <p>Out of {this.state.flips}, there has been {this.state.heads} heads and {this.state.tails} tails.</p>


            </div>
        )

    }
}

export default CoinToss;