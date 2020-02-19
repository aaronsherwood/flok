/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";

import SessionClient from "../lib/SessionClient";
import Button from "./Button";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

type EvaluateCodeArgs = {
  editorId: string;
  target: string;
  body: string;
  fromLine: number;
  toLine: number;
  user?: string;
};

type EvaluateRemoteCodeArgs = {
  editorId: string;
  target: string;
  body: string;
};

type CursorActivityArgs = {
  editorId: string;
  line: number;
  column: number;
};

type Props = {
  sessionClient: SessionClient;
  editorId: string;
  target?: string;
  onEvaluateCode?: (args: EvaluateCodeArgs) => void;
  onEvaluateRemoteCode?: (args: EvaluateRemoteCodeArgs) => void;
  onCursorActivity?: (args: CursorActivityArgs) => void;
};

class TextEditor extends Component<Props, {}> {
  static defaultProps = {
    target: "default",
    onEvaluateCode: () => {},
    onEvaluateRemoteCode: () => {},
    onCursorActivity: () => {}
  };

  cm: any;

  componentDidMount() {
    const { editorId, sessionClient } = this.props;
    const { editor } = this.cm;

    sessionClient.attachEditor(editorId, editor);
  }

  evaluateLine = () => {
    console.log("evaluate line");

    const { editor } = this.cm;

    const currentLine = editor.getCursor().line;
    const lines = editor.getValue().split("\n");
    const code = lines[currentLine].trim();

    if (code !== "") {
      this.evaluate(code, currentLine, currentLine);
    }
  };

  evaluateParagraph = () => {
    console.log("evaluate paragraph");

    const { editor } = this.cm;
    const currentLine = editor.getCursor().line;
    const content = `${editor.getValue()}\n`;
    const lines = content.split("\n");

    let code = "";
    let start = false;
    let stop = false;
    let begin = null;
    let end = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      const lineLength = line.length;
      if (!start) {
        if (!lineLength) {
          code = "";
          begin = i + 1;
          end = begin;
        }
        if (i === currentLine) start = true;
      }
      if (!stop) {
        if (start && !lineLength) {
          stop = true;
          end = i - 1;
        } else if (lineLength) {
          code += `${line}\n`;
        }
      }
    }

    if (code !== "") {
      this.evaluate(code, begin, end);
    }
  };

  evaluate(body: string, fromLine: number, toLine: number) {
    const { editorId, target, onEvaluateCode } = this.props;

    console.debug([fromLine, toLine]);
    console.debug(`Evaluate (${fromLine}-${toLine}): ${JSON.stringify(body)}`);

    onEvaluateCode({ editorId, target, body, fromLine, toLine });
    this.flash(fromLine, toLine);
  }

  flash(fromLine: number, toLine: number) {
    const { editor } = this.cm;

    // Mark text with .flash-selection class
    const marker = editor.markText(
      { line: fromLine, ch: 0 },
      { line: toLine + 1, ch: 0 },
      { className: "flash-selection" }
    );

    // Clear marker after timeout
    setTimeout(() => {
      marker.clear();
    }, 150);
  }

  handleEvaluateCode = ({ body, fromLine, toLine, user }) => {
    const { editorId, target, onEvaluateCode } = this.props;
    return onEvaluateCode({ editorId, target, body, fromLine, toLine, user });
  };

  handleEvaluateRemoteCode = ({ body }) => {
    const { editorId, target, onEvaluateRemoteCode } = this.props;
    return onEvaluateRemoteCode({ editorId, target, body });
  };

  handleEvaluateButtonClick = () => {
    const { editorId, target, onEvaluateCode } = this.props;
    const { editor } = this.cm;

    return onEvaluateCode({
      editorId,
      target,
      body: editor.getValue(),
      fromLine: 0,
      toLine: editor.lineCount()
    });
  };

  render() {
    return (
      <div>
        <div className="evaluate">
          <Button
            icon={faPlayCircle}
            onClick={this.handleEvaluateButtonClick}
          />
        </div>
        <CodeMirror
          className="editor"
          ref={el => {
            this.cm = el;
          }}
          options={{
            mode: "haskell",
            theme: "material",
            lineNumbers: false,
            lineWrapping: true,
            extraKeys: {
              "Shift-Enter": this.evaluateLine,
              "Ctrl-Enter": this.evaluateParagraph,
              "Cmd-Enter": this.evaluateParagraph
            }
          }}
        />
        <style jsx global>{`
          .CodeMirror {
            font-family: Monaco, monospace;
            font-size: 20px;
          }
          .remote-caret {
            position: absolute;
            border-left: black;
            border-left-style: solid;
            border-left-width: 2px;
            height: 1.2em;
          }
          .remote-caret > div {
            position: relative;
            top: 1.5em;
            left: -2px;
            font-size: 16px;
            background-color: rgb(250, 129, 0);
            font-family: Monaco, monospace;
            font-style: normal;
            font-weight: normal;
            line-height: normal;
            user-select: none;
            color: white;
            padding-left: 2px;
            padding-right: 2px;
            z-index: 3;
          }
        `}</style>
      </div>
    );
  }
}

export default TextEditor;