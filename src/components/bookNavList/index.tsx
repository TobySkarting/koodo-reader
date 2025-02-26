//图书导航栏页面的书签页面
import { connect } from "react-redux";
import { stateType } from "../../redux/store";
import { withNamespaces } from "react-i18next";
import BookNavList from "./component";
import { handleMessageBox, handleMessage } from "../../redux/actions/manager";
const mapStateToProps = (state: stateType) => {
  return {
    currentBook: state.book.currentBook,
    currentEpub: state.book.currentEpub,
    bookmarks: state.reader.bookmarks,
    notes: state.reader.notes,
    digests: state.reader.digests,
  };
};
const actionCreator = { handleMessageBox, handleMessage };
export default connect(
  mapStateToProps,
  actionCreator
)(withNamespaces()(BookNavList as any));
