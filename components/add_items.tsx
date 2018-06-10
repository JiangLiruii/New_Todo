import * as React from 'react';
export interface AddItemStates {
    _id: string;
    addDate:string;
    detail: string;
    finishDate: string;
    complete: boolean;
}
interface AddItemProps {
    itemAdd: Function;
}
export default class AddItem extends React.Component<AddItemProps, AddItemStates> {
    constructor(props: AddItemProps) {
        super(props);
        this.state = {
            _id: '',
            addDate:'',
            finishDate:'',
            detail: '',
            complete: false,
        }
    }
    public render() {
        return (
            <div id="first">
                <div id="editor">
                    <input type="text" id="todoInput" onChange={this.onDataChange.bind(this)} placeholder="请输入你接下来要做的事情" value={this.state.detail}/>
                </div>
                <input type="date" id="finishDate" onChange={this.onDataChange.bind(this)} />
                <input type="button" id="addButton" onClick={this.onButtonClick.bind(this)} />
                <span id="prompt"></span>
            </div>
        );
    }

    private onDataChange(e) {
        const value = e.target.value;
        return e.target.type === "date" ? this.setState({ finishDate: value }) : this.setState({ detail: value });
    }

    private getDate() {
        const date = new Date;
        return `${date.getFullYear()}-${date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`}`;
    }

    private onButtonClick() {
        if ( this.state.detail === '') {
            alert('请输入具体待办项');
            return
        }
        const timeStamp = (new Date).getTime();
        this.props.itemAdd({
            detail: this.state.detail,
            _id: timeStamp.toString(),
            addDate: this.getDate(),
            finishDate: this.state.finishDate,
            complete: false,
        },() => this.setState({detail:''}))
    }
}