'user strict'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import PropTypes from '../node_modules/prop-types/index';

import AddItem from './add_items';
import ItemFilter from './item_filter';
import { AddItemStates } from './add_items';
import ItemList, { ItemDetail } from './item_list';
import PaginationComponents from './pagination';

declare const PouchDB;

interface AppState {
    pageTodoItems: Array<ItemDetail>,
    current_page: number,
    filterData: filterData
}

export interface filterData {
    complete: string,
    addDate: string,
    finishDate: string
}

export const dbHandles = React.createContext({
    itemChange: () => { },
    itemDelete: (id, rev) => { },
    titleClick: () => { },
})

export class App extends React.Component<{}, AppState> {
    perPageNumber: number; // 每页展示多少待办项
    filterItems: Array<ItemDetail>;
    allTodoItems: Array<ItemDetail>;
    private db; // 保存数据库
    private descending = true; // 降序排列

    constructor(props: AppState) {
        super(props);
        this.state = {
            pageTodoItems: [],
            current_page: 1,
            filterData: { complete: 'all', addDate: '', finishDate: '' }
        }
        this.perPageNumber = 6;
        this.allTodoItems = [];
        this.filterItems = [];
    }

    componentWillMount(): void {
        this.db = PouchDB('todos') || new PouchDB('todos');
        this.itemSync();
    }
    render() {
        let pages = Math.ceil(this.allTodoItems.length / this.perPageNumber);
        return (
            <div id='react_root'>
                <dbHandles.Provider value={{
                    itemChange: this.itemChange.bind(this),
                    itemDelete: this.itemDelete.bind(this),
                    titleClick: this.titleClick.bind(this),
                }}>
                    <AddItem itemAdd={(item, cb) => { this.itemAdd(item, cb) }} />
                    <ItemFilter itemFilter={this.itemFilter.bind(this)} />
                    <ItemList list={this.state.pageTodoItems} />
                    <PaginationComponents pages={pages} current_page={this.state.current_page} onPageClick={this.onPageClick.bind(this)} />
                </dbHandles.Provider>
            </div>
        )
    }
    /**
     * pagination组件中的点击响应
     * @param click_page 点击的页数
     */
    private onPageClick(click_page) {
        console.log(click_page, this.state.pageTodoItems);

        const itemsStart: number = (click_page - 1) * this.perPageNumber;
        const itemsStop: number = Math.min((click_page) * this.perPageNumber, this.filterItems.length)
        this.setState({
            current_page: click_page,
            pageTodoItems: this.filterItems.slice(itemsStart, itemsStop),
        })
    }
    /**
     * 添加待办函数
     * @param item 点击+按钮添加的item
     * @param cb callback 将输入框置为空
     */
    private itemAdd(item: AddItemStates, cb: Function) {
        this.db.put(item).then((res) => {
            this.filterItems.unshift(Object.assign(item, { _rev: res.rev }));
            this.setPageItems(this.filterItems);
            cb();
        }).catch((err) => { console.log(err) })
    }
    /**
     * 待办同步函数，在需要与数据库整体同步刷新时调用
     */
    private itemSync() {
        this.db.allDocs({ include_docs: true, descending: this.descending, }, (err, res) => {
            if (err) {
                return console.error(err);
            }
            const items = res.rows.map((row) => row.doc)
            this.filterItems = items;
            this.allTodoItems = items;
            this.setPageItems(items);
        })
    }
    /**
     * 设置当前页待办项，从筛选出来的待办项中筛选
     * @param items filterItems
     */
    private setPageItems(items) {
        const itemStart: number = (this.state.current_page - 1) * this.perPageNumber;
        const itemStop: number = Math.min(this.state.current_page * this.perPageNumber, items.length)
        this.setState({
            pageTodoItems: items.slice(itemStart, itemStop),
        })
    }
    /**
     * 当待办项改变时
     * @param changeItem 改变的待办项
     */
    private itemChange(changeItem: any) {
        this.db.put(changeItem).then((docs) => {
            const pageTodoItems = this.state.pageTodoItems
            pageTodoItems.map((item) => {
                if (item._id === changeItem._id) {
                    item._rev = docs.rev;
                }
                return item;
            })
            this.setState({
                pageTodoItems
            })
        });
    }
    /**
     * 删除待办项，至少需要id和rev
     * @param itemId 待办项id
     * @param itemRev 待办项rev
     */
    private itemDelete(itemId, itemRev) {
        this.db.remove(itemId, itemRev).then((docs) => {
            this.allTodoItems = this.allTodoItems.filter((item) => item._id !== itemId)
            this.filterItems = this.filterItems.filter((item) => item._id !== itemId)
            this.setPageItems(this.filterItems);
        })
    }
    /**
     * 待办项筛选，包括是否完成，添加时间，完成时间。
     * @param e filterEvent
     */
    private itemFilter(e) {
        const filterData = {
            complete: e.currentTarget.children[1].value,
            addDate: e.currentTarget.children[4].value,
            finishDate: e.currentTarget.children[6].value,
        }
        const oldState = this.allTodoItems;
        let newState = []
        for (let i = 0, n = oldState.length; i < n; i += 1) {
            if ((!filterData.addDate || oldState[i].addDate === filterData.addDate) &&
                (filterData.complete === 'all' || (oldState[i].complete === (filterData.complete === 'completed'))) &&
                (!filterData.finishDate || oldState[i].finishDate === filterData.finishDate)) {
                newState.push(oldState[i])
            }
        }
        this.filterItems = newState;
        this.setPageItems(newState);
    }
    /**
     * 标题点击时的响应事件，按照制定规则排序（默认按添加顺序排）
     * @param e clickEvent
     */
    private titleClick(e) {
        let className = `${e.target.className.replace('item', '')}`;
        className = className[0].toLowerCase() + className.substr(1);

        let sortedItems = this.allTodoItems;
        if (!this.descending) {
            sortedItems.sort((itemA, itemB) => +(itemA[className] > itemB[className]));
            this.descending = true;
        } else {
            sortedItems.sort((itemA, itemB) => +(itemB[className] > itemA[className]));
            this.descending = false;
        }
        this.setPageItems(sortedItems);
    }
}

ReactDOM.render(
    <App />, document.getElementById('root')
);