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

export class App extends React.Component<{}, AppState> {
    private db;
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
        this.db = PouchDB('todos') || new PouchDB('todos');
    }
    componentDidMount() {
        this.itemSync();
    }
    render() {
        return (<div>
            <AddItem itemAdd={(item) => { this.itemAdd(item) }} />
            {/* <ItemFilter /> */}
            <ItemList list={this.state.todoItems} />
        </div>)
    }
    private itemAdd(item: AddItemStates) {
        this.db.put(item).then((res) => {
            this.setState({
                todoItems: this.state.todoItems.concat({...item,_rev:res.rev}),
            });
        }).catch((err) => { console.log(err) })
    }
    private itemSync() {
        this.db.allDocs({ include_docs: true,descending: true,}).then((res) => {
            console.log(res.rows);
            this.setState({
                todoItems:res.rows.map((row)=>row.doc),
            })
        })
    }
    private itemChange(data:any) {
        this.db.put(data).then((docs) => {
            this.itemSync();
        });
        console.log(data);
    }
    private itemDelete(itemId,itemRev) {
        this.db.remove(itemId,itemRev).then((docs)=>this.itemSync())
    }
}
ReactDOM.render(
    <App />, document.getElementById('root')
);