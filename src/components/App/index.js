import React, { Component } from 'react';
import CSSModules from 'react-css-modules'
import { observable } from 'mobx'
import _ from 'lodash'
import { observer, inject } from 'mobx-react'
import UserStore from '../../stores/UserStore'
import styles from './app.scss'
import NavBar from '../NavBar'
import User from '../../models/User'
import Data from '../../data'

@inject('currentUser')
@observer
@CSSModules(styles)
export default class App extends Component {
  @observable newCount = 0

  constructor(props) {
    super(props)

    this.props.currentUser.fetchMeta()
    this.userStore = new UserStore()

    // setInterval(() => {
    //   Data.updates()
    // }, 2000)

    this.countUnread()
    this.registerHook()
  }

  registerHook() {
    Data.registerMatchesHook(() => {
      this.newCount -= 1
    }, 'updating')

    Data.registerMatchesHook(() => {
      this.newCount += 1
    })
  }

  countUnread() {
    Data.db().matches.where('isNew').equals(1).count(c => {
      this.newCount = c
    })
  }

  render() {
    return (
      <div styleName="page">
        <NavBar user={this.props.currentUser} newCount={this.newCount} />
        {this.props.children && React.cloneElement(this.props.children, {
          userStore: this.userStore,
          currentUser: this.props.currentUser,
        })}
      </div>
    );
  }
}
