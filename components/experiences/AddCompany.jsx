import "date-fns";
import React from "react";
import axios from "axios";
import Spinner from "../spinner/Spinner";
import "../auth/Error.css";
import { useState } from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { connect } from "react-redux";
import AlertUtility from "../Utilities/Alert";
import { useEffect } from "react";
import { useLocation, withRouter } from "react-router-dom";
import useAuthenticatedAxios from "../Utilities/useAuthenticatedAxios.js";

function AddCompany(props) {
  const authenticatedAxios = useAuthenticatedAxios();
  const [companyName, setCompanyName] = useState("");
  const [companySelectedFile, setCompanySelectedFile] = useState(null);

  const [isError, setIsError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const companyID = pathname.split("/")[3];
  const isCompanyPage = !!companyID;
  const successString = isCompanyPage
    ? "Company edited successfully! "
    : "Company added successfully";
  const btnText = isCompanyPage ? "Update" : "Submit";

  const [error, setError] = useState({
    companyNameError: "",
    fileError: "",
  });

  useEffect(() => {
    if (isCompanyPage && companyID) {
      axios
        .get(process.env.REACT_APP_API + `/company/${companyID}`)
        .then((res) => {
          setCompanyName(res.data.companyName);
          setCompanySelectedFile(res.data.companySelectedFile);
        })
        .catch((err) => console.log(err));
    }
  }, [isCompanyPage, companyID]);

  const handleClose = () => {
    setIsSubmitted(false);
    if (props.closeModal !== undefined) props.closeModal(); // EditPage is a page, so no modal
    props.history.push("/managecompanies");
  };

  const isValid = () => {
    let ret = true;
    if (companyName === "") {
      setError((prevError) => ({
        ...prevError,
        companyNameError: "*Company name cannot be empty",
      }));
      ret = false;
    }
    if (!companySelectedFile) {
      setError((prevError) => ({
        ...prevError,
        fileError: "*Company image field cannot be empty",
      }));
      ret = false;
    }
    return ret;
  };

  const onFileChange = (e) => {
    setCompanySelectedFile(e.target.files[0]);
  };

  const handleAddCompany = (event) => {
    event.preventDefault();
    if (isValid()) {
      const formData = new FormData();
      const url = process.env.REACT_APP_API + "/company";
      if (companySelectedFile) {
        formData.append(
          "companyLogo",
          companySelectedFile,
          companySelectedFile.name
        );
      }
      formData.append("companyName", companyName);
      setIsLoading(true);
      authenticatedAxios
        .post(url, formData)
        .then((res) => {
          if (res.status === 200) {
            setIsSubmitted(true);
          } else {
            setIsError(true);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsError(true);
          setIsLoading(false);
          console.log(err);
        });
    }
  };

  const handleEditCompany = (event) => {
    event.preventDefault();
    if (isValid()) {
      const formData = new FormData();
      const url = process.env.REACT_APP_API + `/company/${companyID}`;
      if (companySelectedFile) {
        formData.append(
          "companyLogo",
          companySelectedFile,
          companySelectedFile.name
        );
      }
      formData.append("companyName", companyName);
      setIsLoading(true);
      authenticatedAxios
        .put(url, formData)
        .then((res) => {
          if (res.status === 200) {
            setIsSubmitted(true);
          } else {
            setIsError(true);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsError(true);
          setIsLoading(false);
          console.log(err);
        });
    }
  };

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="jumbotron" style={{ margin: "20px 50px" }}>
          <form onSubmit={isCompanyPage ? handleEditCompany : handleAddCompany}>
            <div className="form-group">
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    placeholder="Company Name"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    label="Enter Company Name"
                    disabled={isCompanyPage}
                  />
                  <div className="errorMsg">{error.companyNameError}</div>
                </Grid>
              </Grid>
            </div>
            <div className="form-group">
              <label>Company Logo:</label>
              <input
                type="file"
                className="btn"
                name="companyLogo"
                accept="image/*"
                onChange={onFileChange}
              />
              <div className="errorMsg">{error.fileError}</div>
            </div>
            <Grid container spacing={1}>
              <Grid item>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Button type="submit" variant="outlined" color="primary">
                    {btnText}
                  </Button>
                )}
              </Grid>
              <Grid item>
                {isCompanyPage && (
                  <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    className="btn btn-primary"
                    onClick={() => props.history.goBack()}
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </div>
      </MuiPickersUtilsProvider>
      <AlertUtility
        open={isSubmitted}
        duration={3000}
        onCloseHandler={handleClose}
        severity="success"
        message={successString + " Reloading companies..."}
      />
      <AlertUtility
        open={isError}
        duration={2000}
        onCloseHandler={() => {
          setIsError(false);
        }}
        severity="error"
        message="Oops! An error occurred. Please try again."
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  userID: state.auth.userID,
  token: state.auth.token,
  username: state.auth.username,
});

export default withRouter(connect(mapStateToProps)(AddCompany));
