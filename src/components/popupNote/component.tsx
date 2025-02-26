import React from "react";
import "./popupNote.css";
import Note from "../../model/Note";
import localforage from "localforage";
import { PopupNoteProps, PopupNoteState } from "./interface";
import RecordLocation from "../../utils/recordLocation";
import NoteTag from "../noteTag";
import NoteModel from "../../model/Note";
import { Trans } from "react-i18next";

declare var window: any;

class PopupNote extends React.Component<PopupNoteProps, PopupNoteState> {
  constructor(props: PopupNoteProps) {
    super(props);
    this.state = { tag: [] };
  }
  componentDidMount() {
    let textArea: any = document.querySelector(".editor-box");
    textArea && textArea.focus();
  }
  handleTag = (tag: string[]) => {
    console.log(tag, "tag pop");
    this.setState({ tag });
  };
  createNote() {
    let notes = (document.querySelector(".editor-box") as HTMLInputElement)
      .value;

    if (this.props.noteKey) {
      //编辑笔记
      this.props.notes.forEach((item) => {
        if (item.key === this.props.noteKey) {
          item.notes = notes;
          item.tag = this.state.tag;
        }
      });
      localforage.setItem("notes", this.props.notes).then(() => {
        this.props.handleOpenMenu(false);
        this.props.handleMessage("Add Successfully");
        this.props.handleMessageBox(true);
        this.props.handleFetchNotes();
        this.props.handleMenuMode("highlight");
        this.props.handleNoteKey("");
        console.log("edit");
      });
    } else {
      //创建笔记
      let bookKey = this.props.currentBook.key;
      const currentLocation = this.props.currentEpub.rendition.currentLocation();
      let chapterHref = currentLocation.start.href;
      let chapterIndex = currentLocation.start.index;
      let chapter = "Unknown Chapter";
      let currentChapter = this.props.flattenChapters.filter(
        (item: any) => item.href.split("#")[0] === chapterHref
      )[0];
      if (currentChapter) {
        chapter = currentChapter.label.trim(" ");
      }

      const cfi = RecordLocation.getCfi(this.props.currentBook.key).cfi;

      let iframe = document.getElementsByTagName("iframe")[0];
      if (!iframe) return;
      let doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      let charRange = window.rangy
        .getSelection(iframe)
        .saveCharacterRanges(doc.body)[0];
      let range = JSON.stringify(charRange);
      let text = doc.getSelection()?.toString();
      if (!text) {
        return;
      }
      text = text.replace(/\s\s/g, "");
      text = text.replace(/\r/g, "");
      text = text.replace(/\n/g, "");
      text = text.replace(/\t/g, "");
      text = text.replace(/\f/g, "");
      let percentage =
        RecordLocation.getCfi(this.props.currentBook.key) === null
          ? 0
          : RecordLocation.getCfi(this.props.currentBook.key).percentage;

      let color = this.props.color || 0;
      let tag = this.state.tag;
      let note = new Note(
        bookKey,
        chapter,
        chapterIndex,
        text,
        cfi,
        range,
        notes,
        percentage,
        color,
        tag
      );
      let noteArr = this.props.notes;
      noteArr.push(note);
      localforage.setItem("notes", noteArr).then(() => {
        this.props.handleOpenMenu(false);
        this.props.handleMessage("Add Successfully");
        this.props.handleMessageBox(true);
        this.props.handleFetchNotes();
        this.props.handleMenuMode("highlight");
        console.log("new");
      });
    }
  }
  handleClose = () => {
    let noteIndex;
    if (this.props.noteKey) {
      this.props.notes.forEach((item, index) => {
        if (item.key === this.props.noteKey) {
          noteIndex = index;
        }
      });
      if (noteIndex) {
        this.props.notes.splice(noteIndex, 1);
        localforage.setItem("notes", this.props.notes).then(() => {
          this.props.handleOpenMenu(false);
          this.props.handleMenuMode("menu");
          this.props.handleMessage("Delete Successfully");
          this.props.handleMessageBox(true);
          this.props.handleMenuMode("highlight");

          this.props.handleNoteKey("");
        });
      }
    } else {
      this.props.handleOpenMenu(false);
      this.props.handleMenuMode("menu");
      this.props.handleNoteKey("");
    }
  };

  render() {
    let note: NoteModel;
    if (this.props.noteKey) {
      this.props.notes.forEach((item) => {
        if (item.key === this.props.noteKey) {
          note = item;
        }
      });
    }

    const renderNoteEditor = () => {
      return (
        <div className="note-editor">
          <div className="editor-box-parent">
            <textarea className="editor-box" />
          </div>
          <div
            className="note-tags"
            style={{ position: "absolute", bottom: "0px", height: "70px" }}
          >
            <NoteTag
              {...{
                handleTag: this.handleTag,
                tag: this.props.noteKey ? note.tag : [],
              }}
            />
          </div>

          <div className="note-button-container">
            <span
              className="cancel-button"
              onClick={() => {
                this.handleClose();
              }}
            >
              {this.props.noteKey ? (
                <Trans>Delete</Trans>
              ) : (
                <Trans>Cancel</Trans>
              )}
            </span>
            <span
              className="confirm-button"
              onClick={() => {
                this.createNote();
              }}
            >
              <Trans>Confirm</Trans>
            </span>
          </div>
        </div>
      );
    };
    return renderNoteEditor();
  }
}
export default PopupNote;
