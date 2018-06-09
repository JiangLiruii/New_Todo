'user strict'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AddItemStates } from './add_items';
import AddItem from './add_items';
import ItemFilter from './item_filter';
import ItemList,{ItemDetail} from './item_list';
import PropTypes from '../node_modules/prop-types/index';

import PaginationComponents from './pagination';
declare const PouchDB;
interface AppState {
    pageTodoItems:Array<ItemDetail>,
    filterTodoItems:Array<ItemDetail>,
    allTodoItems:Array<ItemDetail>,
    current_page:number,
    filterData:filterData
}

export interface filterData {
    complete:string,
    addDate:string,
    finishDate:string
}

export interface AppContext {
    itemChange:Function,
    itemDelete:Function,
    titleClick:Function,
}

export class App extends React.Component<{}, AppState> {
    perPageNumber:number;
    private db;
    private descending = true;
    constructor(props: AppState) {
        super(props);
        this.state = {
            pageTodoItems: [],
            allTodoItems: [],
            filterTodoItems: [],
            current_page: 1,
            filterData:{complete:'all',addDate:'',finishDate:''}
        }
        this.perPageNumber = 6;
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
        let pages = Math.ceil(this.state.allTodoItems.length / this.perPageNumber);
        return (<div>
            <AddItem itemAdd={(item) => { this.itemAdd(item) }} />
            <ItemFilter itemFilter={this.itemFilter.bind(this)}/>
            <ItemList list={this.state.pageTodoItems} />
            <PaginationComponents pages={pages} current_page={this.state.current_page} onPageClick={this.onPageClick.bind(this)}/>
        </div>)
    }

    private onPageClick(click_page) {
        console.log(click_page,this.state.pageTodoItems);
        
        const itemsStart:number = (click_page - 1) * this.perPageNumber;
        const itemsStop:number = Math.min((click_page) * this.perPageNumber, this.state.filterTodoItems.length)
        this.setState({
            current_page: click_page,
            pageTodoItems: this.state.filterTodoItems.slice(itemsStart, itemsStop),
        })
        console.log(this.state.filterTodoItems, this.state.pageTodoItems);
        
    }
    private itemAdd(item: AddItemStates) {
        this.db.put(item).then((res) => {
            this.itemSync();
        }).catch((err) => { console.log(err) })
    }
    private itemSync() {
        this.db.allDocs({ include_docs: true, descending: this.descending,},(err,res) => {
            if(err) {
                return console.log(err);
            }
            const items = res.rows.map((row)=>row.doc)
            this.setItems(items);
            this.setState({
                allTodoItems:items,
                filterTodoItems:items
            })
        })
    }

    private setItems(items) {
        
        const itemsStart:number = (this.state.current_page - 1) * this.perPageNumber;
        const itemsStop:number = Math.min(this.state.current_page * this.perPageNumber, items.length)
        
        this.setState({
            pageTodoItems:items.slice(itemsStart, itemsStop),
        })
        console.log('setState',this.state.pageTodoItems, itemsStart, itemsStop);
        
        
    }
    private itemChange(data:any,cb:Function) {
        this.db.put(data).then((docs) => {
            console.log(docs);
            
            cb(docs.rev);
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
            filterTodoItems:newState,
        })
    }
    private titleClick(e) {
        let className = `${e.target.className.replace('item', '')}`;
        className = className[0].toLowerCase() + className.substr(1);
      
        let sortedItems = this.state.allTodoItems;
        if (!this.descending) {
          sortedItems.sort((itemA, itemB) => +(itemA[className] > itemB[className]));
          this.descending = true;
        } else {
          sortedItems.sort((itemA, itemB) => +(itemB[className] > itemA[className]));
          this.descending = false;
        }
        this.setItems(sortedItems);
    }
}
ReactDOM.render(
    <App />, document.getElementById('root')
);