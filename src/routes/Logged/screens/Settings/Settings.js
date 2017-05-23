// @flow

import './Settings.scss';

import React from 'react';
import ReactGA from 'react-ga';
import { compose, withHandlers, withState, lifecycle } from 'recompose';
import { observer } from 'mobx-react';
import { Button, Classes, Switch } from '@blueprintjs/core';
import ReactTooltip from 'react-tooltip';
import trim from 'lodash/trim';

import LocationMap from 'components/LocationMap';
import MessageEmoji from 'components/conversation/MessageEmoji';

import LS from 'utils/localStorage';

import currentUser from 'models/CurrentUser';

const enhance = compose(
  withState('bio', 'setBio', () => currentUser.bio),
  withState('notif', 'setNotif', () => !!LS.settings.notifCloudEnabled || true),
  withState('templates', 'setTemplates', () => LS.templates),
  withState('templateValue', 'setTemplateValue', ''),
  withState('emojiOpen', 'setEmojiOpen', false),
  withHandlers({
    handleChange: ({ setBio }) => ({ target }) => {
      setBio(target.value);
    },
    handleTemplateValueChange: ({ setTemplateValue }) => ({ target }) => {
      setTemplateValue(target.value);
    },
    handleSave: ({ bio }) => () => {
      ReactGA.event({
        category: 'Settings',
        action: 'Profile update',
      });
      currentUser.updateProfile({
        bio,
      });
    },
    handleNotifChange: ({ setNotif }) => ({ target }) => {
      setNotif(target.checked);
      LS.setSettings({ notifCloudEnabled: target.checked });

      ReactGA.event({
        category: 'Settings',
        action: 'Notification change',
      });
    },
    handleTemplateRemove: ({ setTemplates }) => (index) => {
      LS.removeTemplateAt(index);
      setTemplates(LS.templates);

      ReactGA.event({
        category: 'Settings',
        action: 'Template Remove',
      });
    },
    handleCreateTemplate: ({ templateValue, setTemplateValue, setTemplates }) => () => {
      if (!templateValue) return;

      LS.createTemplate(trim(templateValue));
      setTemplateValue('');
      setTemplates(LS.templates);

      if (window.hj) window.hj('tagRecording', ['Template', 'Create']);

      ReactGA.event({
        category: 'Settings',
        action: 'Template create',
      });
    },
    handleEmojiToggle: ({ setEmojiOpen, emojiOpen }) => () => {
      setEmojiOpen(true);
    },
    handleEmojiSelect: ({ templateValue, setTemplateValue, setEmojiOpen }) => (emoji: string) => {
      setTemplateValue(templateValue + emoji);
      setEmojiOpen(false);
    },
  }),
  lifecycle({
    componentDidMount: () => {
      ReactTooltip.rebuild();
    }
  }),
  observer,
);

const TemplateRow = ({ value, onRemove }) => (
  <tr>
    <td>
      <button type="button" className="pt-button pt-icon-trash" onClick={onRemove} />
    </td>
    <td>{value}</td>
  </tr>
);

const Settings = ({
  bio, handleChange, handleSave, handleNotifChange, notif, handleTemplateRemove,
  templates, templateValue, handleTemplateValueChange, handleCreateTemplate, emojiOpen,
  handleEmojiSelect, handleEmojiToggle, setEmojiOpen,
}) => (
  <div className="settings">
    <div className="settings__row">
      <label>Bio</label>
      <div className="settings__field">
        <textarea className="pt-input" rows="4" value={bio} onChange={handleChange} />
      </div>
    </div>
    <div className="settings__row">
      <label>
        Your current location
        {!currentUser.pos.lat && <i className="fa fa-question-circle" data-for="main" data-tip="Be careful with significant changes! <br />I do not take responsibility for any possible problems with ban etc." />}
        {!!currentUser.pos.lat && <span>(update by clicking somewhere)</span>}
      </label>
      <div className="settings__field">
        <LocationMap currentUser={currentUser} />
      </div>
    </div>
    <div className="settings__row">
      <div className="settings__field">
        <Button
          className={Classes.LARGE}
          onClick={handleSave}
          loading={currentUser.isProcessing}
          text="Save"
        />
      </div>
    </div>
    <div className="settings__separator"><span>Saved only locally</span></div>
    <div className="settings__row">
      <label>Create message template</label>
      <span className="settings__info">Use variable like: <b>{'{{name}}'}</b> to replace with interlocutor real name.</span>
      <div className="settings__field">
        {emojiOpen && <MessageEmoji onClose={() => setEmojiOpen(false)} onEmojiSelect={handleEmojiSelect} />}
        <div className="settings__field">
          <textarea className="pt-input" value={templateValue} onChange={handleTemplateValueChange} />
        </div>
        <div className="settings__field">
          <button type="button" className="pt-button pt-intent-primary pt-icon-add" onClick={handleCreateTemplate}>Add</button>
          <button type="button" className="pt-button pt-icon-user" onClick={handleEmojiToggle}>Emoji</button>
        </div>
      </div>
    </div>
    <div className="settings__row">
      <label>Templates list</label>
      <div className="settings__field">
        {templates.length === 0 ?
          <h5>Empty</h5> :
          <table className="pt-table pt-condensed pt-striped settings__field-table">
            <thead>
              <th width="50px"></th>
              <th>Text</th>
            </thead>
            <tbody>
              {templates.map((value, i) => (
                <TemplateRow key={i} onRemove={() => handleTemplateRemove(i)} value={value} />
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
    <div className="settings__row">
      <Switch checked={notif} label="Show bottom left notification when swiping" onChange={handleNotifChange} />
    </div>
  </div>
);

export default enhance(Settings);
