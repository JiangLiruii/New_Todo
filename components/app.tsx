'user strict'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AddItemStates } from './add_items';
import AddItem from './add_items';

interface AppState {
    todoItems:Array<any>,
}

const db = new PouchDB('todos');
export class App extends React.Component<{},AppState> {
    constructor(props:AppState){
        super(props);
        this.state = {
            todoItems:[],
        }
    }
    componentWillMount(): void {

    }
    render(){
        return <AddItem itemAdd={(item)=>{this.itemAdd(item)}} />
    }
    private itemAdd(item:AddItemStates) {
        db.put(item).then((res) => {
            this.setState({
                todoItems: this.state.todoItems.concat(item),
            });
            console.log(1);
            db.allDocs({include_docs:true}).then((res)=>console.log(res))
        }).catch((err)=>{console.log(err)})
    }
}
ReactDOM.render(
    <App />,document.getElementById('root')
);