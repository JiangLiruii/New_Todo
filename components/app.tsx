'user strict'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AddItemStates } from './add_items';
import AddItem from './add_items';
import ItemFilter from './item_filter';
import ItemList,{ItemDetail} from './item_list';
import PropTypes from '../node_modules/prop-types/index';
declare const PouchDB;
interface AppState {
    todoItems: Array<ItemDetail>,
}
export interface AppContext {
    itemChange:Function,
    itemDelete:Function,
}

const db = PouchDB('todos') || new PouchDB('todos');
export class App extends React.Component<{}, AppState> {
    constructor(props: AppState) {
        super(props);
        this.state = {
            todoItems: [],
        }
    }
    
    static childContextTypes = {
        itemChange:PropTypes.func,
        itemDelete:PropTypes.func,
    };
    getChildContext() {
        return {
            itemChange:this.itemChange.bind(this),
            itemDelete:this.itemDelete.bind(this),
        }
    }
    componentWillMount(): void {

    }
    render() {
        return (<div>
            <AddItem itemAdd={(item) => { this.itemAdd(item) }} />
            {/* <ItemFilter /> */}
            <ItemList list={this.state.todoItems} />
        </div>)
    }
    private itemAdd(item: AddItemStates) {
        db.put(item).then((res) => {
            this.setState({
                todoItems: this.state.todoItems.concat({...item,_rev:res.rev}),
            });
        }).catch((err) => { console.log(err) })
    }
    private itemSync() {
        db.allDocs({ include_docs: true }).then((res) => {
            console.log(res.rows);
            this.setState({
                todoItems:res.rows,
            })
        })
    }
    private itemChange(data:any) {
        db.put(data).then((docs) => {
            console.log(docs)
            // this.itemSync();
        });
        console.log(data);
    }
    private itemDelete(item:ItemDetail){

    }
}
ReactDOM.render(
    <App />, document.getElementById('root')
);