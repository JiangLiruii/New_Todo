import * as React from 'react'
import {AppContext} from './app'
import PropTypes from '../node_modules/prop-types/index';


interface ItemProp {
  item: {complete:boolean,detail:string,addDate:string,finishDate:string,_id:string,_rev:string};
}

interface ItemState {
}

export default class Item extends React.Component<ItemProp, ItemState> {
  context:AppContext;
  constructor(props: ItemProp) {
    super(props);
  }

  static contextTypes= {
    itemChange:PropTypes.func,
    itemDelete:PropTypes.func,
};;


  render() {
    const item = this.props.item;
    return (<div className="contentWrap" >
      <span className="complete"><input type='checkbox' checked={item.complete} onChange={this.onDataChange.bind(this)} /></span>
      <span className="detail"><input value={item.detail} onChange={this.onDataChange.bind(this)} /></span>
      <span className="date"><div>{item.addDate}</div></span>
      <span className="finishDate"><input type="date" value={item.finishDate} onChange={this.onDataChange.bind(this)} /></span>
      <span className='itemDelete'><button onClick={()=>this.context.itemDelete(item._id,item._rev)}>x</button></span>
    </div>)
  }

  private onDataChange (e) {
    const key = e.target.parentNode.className;
    const item = this.state.item;
    let value = e.target.value; 
    if (key === 'complete') {
      value = !item.complete
    }
    console.log(key,value);
    this.state.item[key] = value;
    console.log(this.state);
    
    this.context.itemChange(this.state.item,this.updateRef.bind(this))
  }
  private updateRef(rev) {
    console.log(rev);
    
    this.setState({
      item: Object.assign({},this.state.item,{_rev:rev})
    })
  }
}