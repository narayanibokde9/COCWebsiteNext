import React, { useState, useEffect, useRef } from "react";
import { useLocation, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import BackButton from "../Utilities/BackButton";
import axios from "axios";
import { Spinner } from "react-bootstrap";

import { Container, Grid, Typography, Box } from "@material-ui/core";
import "../auth/Error.css";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import LinkTool from "@editorjs/link";
import RawTool from "@editorjs/raw";
import List from "@editorjs/list";
import CodeTool from "@editorjs/code";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import { StyleInlineTool } from "editorjs-style";

const EDITTOR_HOLDER_ID = "editorjs";

const ReadExperience = (props) => {
  const ejInstance = useRef();
  const [exp, setExp] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { pathname } = useLocation();
  const interviewID = pathname.split("/")[2];

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(process.env.REACT_APP_API + `/interview/${interviewID}`)
      .then((res) => {
        setExp(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (exp.content) {
      initEditor();
    }
  }, [exp]);

  const initEditor = () => {
    const editor = new EditorJS({
      readOnly: true,
      holder: EDITTOR_HOLDER_ID,
      logLevel: "ERROR",
      data: exp.content,
      placeholder: "type here...",
      onReady: () => {
        ejInstance.current = editor;
      },
      onChange: () => {
        editor
          .save()
          .then((outputData) => {})
          .catch((error) => {
            console.log(error);
          });
      },
      autofocus: true,
      tools: {
        header: Header,
        linkTool: LinkTool,
        raw: RawTool,
        list: { class: List, inlineToolbar: true },
        code: CodeTool,
        table: Table,
        style: StyleInlineTool,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file) {
                const formData = new FormData();
                if (file) {
                  formData.append("expImage", file, file.name);
                }
                const res = await axios.post(
                  process.env.REACT_APP_API + "/interviewImageUpload",
                  formData
                );
                return res.data;
              },
            },
          },
        },
      },
    });
  };

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <React.Fragment>
          <Box px={1} pt={1} mx={2} mt={2}>
            <BackButton link={`/exp/list/${exp.company}`} />
          </Box>
          <Box pb={6}>
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Box mt={4}>
                    <Typography
                      style={{ color: "#224903", fontWeight: "bold" }}
                      variant="h4"
                    >
                      {exp.companyRequest} Experience
                    </Typography>
                    <Typography
                      style={{ color: "#5e5e5e", fontWeight: "500" }}
                      variant="h6"
                    >
                      by {exp.createdBy}
                    </Typography>
                    <Typography
                      style={{ color: "#5e5e5e", fontWeight: "500" }}
                      variant="h6"
                    >
                      {exp.appliedFor}, {exp.appliedYear}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#fafafa",
                      borderRadius: "5px",
                      padding: "5px",
                    }}
                    id={EDITTOR_HOLDER_ID}
                  ></div>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </React.Fragment>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  userID: state.auth.userID,
  token: state.auth.token,
  username: state.auth.username,
});

export default withRouter(connect(mapStateToProps)(ReadExperience));
