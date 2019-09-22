import React from 'react';
import { connect } from 'react-redux';
// import BarChart from '../BarChart'
import './styles.scss';
import styled from "styled-components"


const Bar = styled.span`

    background-color: ${props => props.backgroundColor || "rgb(204, 227, 241)"};
    background-position: 50% center;
    position: absolute;
    height: 20px;
    right: ${props => props.right || "none"};
    left: ${props => props.left || "none"};
    z-index: 1;
    min-width: ${props => props.percent || '60%'};
  &:last-child {
    border-bottom: none;
  }
`;

class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.lastUpdatedAt = null;
    this.forceRenderTimer = null;
  }
 
  // max 1 render in 1 second
  shouldComponentUpdate() {
    if (this.lastUpdatedAt) {
      const diff = new Date().valueOf() - this.lastUpdatedAt;
      const shouldRender = diff > 1000;

      if (!shouldRender && !this.forceRenderTimer) {
        this.forceRenderTimer = setTimeout(() => {
          this.forceUpdate();
          this.forceRenderTimer = null;
        }, 1000 - diff);
      }
      return shouldRender;
    } else {
      return true;
    }
  }

  componentWillUnmount() {
    if (this.forceRenderTimer) {
      clearInterval(this.forceRenderTimer);
    }
  }

  componentDidUpdate() {
    this.lastUpdatedAt = new Date();
  }

  render() {
    let { bids, asks, websocketConnected, currentMarket } = this.props;

    return (
      <div className="orderbook flex-column flex-1">
        <div className="flex header text-secondary">
          <div className="col-4 text-center"> <b>Amount</b> </div>
          <div className="col-4 text-center"><b>Price</b></div>
          <div className="col-4 text-center">-  </div>
        </div>
        <div className="flex-column flex-1">
          <div className="asks flex-column flex-column-reverse">
            {asks
              .slice(-20)
              .reverse()
              .toArray()
              .map(([price, amount], index) => {
                const barPercent = ((price.toFixed(currentMarket.priceDecimals) + (currentMarket.lastPriceIncrease)) / 100 )* 1000; 
                return (
                  <div className={`ask flex align-items-center ${index % 2 && 'orderbook-gray'}`} key={price.toString()}>
                    <div className="col-4 orderbook-amount text-left">
                        <span className="price orderbook-textBlack" style={{position: "relative", zIndex: 2}}>
                            <span>{amount.toFixed(currentMarket.amountDecimals)}</span>
                        </span>
                            <Bar right={"-1px"} percent={barPercent + "%"}/>
                    </div>
                    <div className="col-4 text-center orderbook-opacGray orderbook-textBlue"><div><b>{price.toFixed(currentMarket.priceDecimals)}</b>
                 {/*Since every Dai is worth $1, and will always be worth $1. I've shown price as it is */}
                    </div><div className="orderbook-currency">{price.toFixed(currentMarket.priceDecimals)} <b>USD</b></div>
                    </div>
                    <div className="col-4 orderbook-amount text-center">
                    -
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="status border-top border-bottom">
            {websocketConnected ? (
              <div className="col-6 text-success">
                <i className="fa fa-circle" aria-hidden="true" /> RealTime
              </div>
            ) : (
              <div className="col-6 text-danger">
                <i className="fa fa-circle" aria-hidden="true" /> Disconnected
              </div>
            )}
          </div>
          <div className="bids flex-column flex-1">
            {bids
              .slice(0, 20)
              .toArray()
              .map(([price, amount], index) => {
                 const barPercent = ((price.toFixed(currentMarket.priceDecimals) + (currentMarket.lastPriceIncrease)) / 100 )* 1000; 
                return (
                  <div className={`bid flex align-items-center ${index % 2 && 'orderbook-gray'}`} key={price.toString()}>
                    <div className="col-4 orderbook-amount text-center">
                        -
                    </div>
                    <div className="col-4 text-center orderbook-gray orderbook-opacRed orderbook-textBlue"><div><b>{price.toFixed(currentMarket.priceDecimals)}</b></div>
                    {/*Since every Dai is worth $1, and will always be worth $1. I've shown price as it is */}
                    <div className="orderbook-currency">{price.toFixed(currentMarket.priceDecimals)} <b>USD</b></div>
                    </div>
                    <div className="col-4 text-center orderbook-textBlack">
                        <span className="price orderbook-textBlack" style={{position: "relative", zIndex: "2"}}>
                                <span>{amount.toFixed(currentMarket.amountDecimals)}</span>
                            </span>
                        <Bar left={"-1px"}
                             backgroundColor={"rgb(241, 203, 202)"}
                             percent={barPercent + "%"}
                        />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    asks: state.market.getIn(['orderbook', 'asks']),
    bids: state.market.getIn(['orderbook', 'bids']),
    loading: false,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    websocketConnected: state.config.get('websocketConnected'),
    theme: state.config.get('theme')
  };
};

export default connect(mapStateToProps)(OrderBook);
