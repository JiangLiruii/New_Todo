import * as React from 'react';

interface PaginationProps {
  pages:number,
  current_page: number,
  onPageClick:Function,
}

interface PaginationStates {

}

export default class PaginationComponents extends React.Component<PaginationProps, PaginationStates> {
  public render() {
    const getPage = (pages) =>{
      const res = [];
      for (let i = 1; i <= pages; i ++) {
        res.push(<span className={this.props.current_page === i ? 'active' : ''} id={`${i}`} key={i}> {i} </span>)
      }
      return res;
    }
    return (
      <div className={'pages'} onClick={(e)=>this.onPageClick(e)}>
        <span id='1' key={0}>首页</span>
        {getPage(this.props.pages)}
        <span id={`${this.props.pages}`} key={-1}>尾页</span>
      </div>
    );
  }
  private onPageClick(e) {
    if (e.target === e.currentTarget) {
      return;
    }
    this.props.onPageClick(+e.target.id)
  }
}