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
    allTodoItems:Array<ItemDetail>
}
export interface AppContext {
    itemChange:Function,
    itemDelete:Function,
    titleClick:Function,
}

export class App extends React.Component<{}, AppState> {
    private db;
    private descending = true;
    constructor(props: AppState) {
        super(props);
        this.state = {
            todoItems: [],
            allTodoItems:[],
        }
    }
    
    static childContextTypes = {
        itemChange:PropTypes.func,
        itemDelete:PropTypes.func,
        titleClick:PropTypes.func,
    };
    getChildContext() {
        return {
            itemChange:this.itemChange.bind(this),
            itemDelete:this.itemDelete.bind(this),
            titleClick:this.titleClick.bind(this)
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
            <ItemFilter itemFilter={this.itemFilter.bind(this)}/>
            <ItemList list={this.state.todoItems} />
        </div>)
    }
    private itemAdd(item: AddItemStates) {
        this.db.put(item).then((res) => {
            this.state.todoItems.unshift({...item,_rev:res.rev})
            this.setState({
                todoItems: this.state.todoItems,
            });
        }).catch((err) => { console.log(err) })
    }
    private itemSync() {
        this.db.allDocs({ include_docs: true, descending: this.descending,},(err,res) => {
            if(err) {
                return console.log(err);
            }
            const items = res.rows.map((row)=>row.doc)
            this.setState({
                todoItems:items,
                allTodoItems:items,
            })
        })
    }
    private itemChange(data:any) {
        this.db.put(data).then((docs) => {
            this.itemSync();
        });
    }
    private itemDelete(itemId,itemRev) {
        this.db.remove(itemId,itemRev).then((docs)=>this.itemSync())
    }
    private itemFilter(e) {
        const filterData = {
            complete:e.currentTarget.children[1].value,
            addDate:e.currentTarget.children[4].value,
            finishDate:e.currentTarget.children[6].value,
        }
        const oldState = this.state.allTodoItems;
        let newState = []
        for(let i = 0, n = oldState.length; i < n; i += 1) {
            if((!filterData.addDate || oldState[i].addDate === filterData.addDate) && 
               (filterData.complete === 'all' || (oldState[i].complete === (filterData.complete === 'completed'))) && 
               (!filterData.finishDate || oldState[i].finishDate === filterData.finishDate)) {
                newState.push(oldState[i])
            }
        }
        this.setState({
            todoItems:newState
        })
    }
    private titleClick(e) {
        let className = `${e.target.className.replace('item', '')}`;
        className = className[0].toLowerCase() + className.substr(1);
      
        let sortedContent = this.state.allTodoItems;
        if (!this.descending) {
          sortedContent.sort((itemA, itemB) => +(itemA[className] > itemB[className]));
          this.descending = true;
        } else {
          sortedContent.sort((itemA, itemB) => +(itemB[className] > itemA[className]));
          this.descending = false;
        }
        this.setState({
            todoItems:sortedContent,
        })
    }
}
ReactDOM.render(
    <App />, document.getElementById('root')
);