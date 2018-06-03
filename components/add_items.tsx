import * as React from 'react';
export interface AddItemStates {
    _id: string;
    detail: string;
    addDate: string;
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
            addDate: '',
            finishDate:'',
            detail: '',
            complete: false,
        }
    }
    public render() {
        return (
            <div id="first">
                <input type="text" onChange={(e) => { this.setState({ detail: e.target.value }) }} placeholder="请输入你接下来要做的事情" />
                <input type="date" onChange={this.onDataChange.bind(this)} />
                <input type="button" id="addButton" onClick={this.onButtonClick.bind(this)} />
                <span id="prompt"></span></div>
        );
    }
    private onDataChange(e) {
        const value = e.target.value;
        return e.target.type === "date" ? this.setState({ addDate: value }) : this.setState({ detail: value });
    }
    private onButtonClick() {
        const timeStamp = (new Date).getTime();
        this.props.itemAdd({
            detail: this.state.detail,
            _id: timeStamp.toString(),
            addDate: this.state.addDate,
            complete: false,
        })
    }
}