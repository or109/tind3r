// @flow

import { observable, action, computed } from 'mobx';
import moment from 'moment';
import last from 'lodash/last';
import uniqueId from 'lodash/uniqueId';

import { getMessages, getPerson, getMatch } from '../utils/database.v2';
import Message from '../models/Message';
import Person from '../models/Person';

import type { MessageType } from 'types/Message';

class MessageStore {
  matchId: ?string;

  @observable interlocutor: Person | Object = {};
  @observable messages: Array<Message> = [];

  constructor(matchId: ?string) {
    this.matchId = matchId;
  }

  @action fetch(matchId: string) {
    this.messages = [];

    const messages = getMessages(matchId);
    const match = getMatch(matchId);

    this.interlocutor = new Person(this, getPerson(match.person_id));

    messages.forEach(action(message => this.create(message)));
  }

  @action create(data: MessageType) {
    const message: Message = new Message(this, data);

    this.messages.push(message);
  }

  @action submit(body: string, matchId: string, fromId: string) {
    const data = {
      _id: uniqueId,
      body,
      match_id: matchId,
      from_id: fromId,
      date: moment().format(),
    }

    const message: Message = new Message(this, data);
    message.save();

    this.messages.push(message);
  }

  @computed get lastMessage(): ?Message {
    return last(this.messages);
  }
}

export default MessageStore;
