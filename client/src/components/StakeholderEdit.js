import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  withStyles,
  Box,
  Checkbox,
  Container,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  List,
} from "@material-ui/core";
import * as stakeholderService from "../services/stakeholder-service";
import * as categoryService from "../services/category-service";
import * as esriService from "../services/esri_service";
import OpenTimeForm from "./OpenTimeForm";
import { SaveButton, CloseButton, SearchButton, VerifyButton } from "./Buttons";

import moment from "moment";

const styles = (theme) => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  tooltip: {
    backgroundColor: "#0000FF",
  },
});

const BigTooltip = withStyles((theme) => ({
  tooltip: {
    fontSize: 16,
  },
}))(Tooltip);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  address1: Yup.string().required("Street address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zip: Yup.string().required("Zip code is required"),
  phone: Yup.string().required("Phone is required"),
  latitude: Yup.number().required("Latitude is required").min(-90).max(90),
  longitude: Yup.number().required("Longitude is required").min(-180).max(180),
  email: Yup.string().email("Invalid email address format"),
  selectedCategoryIds: Yup.array().min(
    1,
    "You must select at least one category"
  ),
});

const emptyStakeholder = {
  id: 0,
  name: "",
  description: "",
  parentOrganization: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  physicalAccess: "",
  items: "",
  services: "",
  facebook: "",
  twitter: "",
  pinterest: "",
  linkedin: "",
  inactive: false,
  website: "",
  notes: "",
  requirements: "",
  adminNotes: "",
  createdDate: "",
  createdUser: "",
  modifiedDate: "",
  modifiedUser: "",
  verifiedDate: "",
  verifiedUser: "",
  selectedCategoryIds: [],
  hours: [],
};

const StakeholderEdit = (props) => {
  const { classes, setToast, match, user, history } = props;
  const editId = match.params.id;
  const [categories, setCategories] = useState([]);
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [originalData, setOriginalData] = useState(emptyStakeholder);

  useEffect(() => {
    console.log("StakeholderEdit component loading...");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await categoryService.getAll();
        const activeCategories = categories.filter(
          (category) => !category.inactive
        );
        setCategories(activeCategories);

        if (editId) {
          const stakeholder = await stakeholderService.getById(editId);
          // For editing purposes, it is better to convert the
          // stakeholder.categories array of objects to an array of
          // categoryIds as stakeholder.categoryIds
          stakeholder.selectedCategoryIds = stakeholder.categories.map(
            (category) => category.id
          );
          delete stakeholder.categories;

          setOriginalData(stakeholder);
        } else {
          setOriginalData(emptyStakeholder);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [editId]);

  const cancel = () => {
    //props.history.goBack();
    props.history.push("/home");
  };

  const verify = (setVerify) => {
    stakeholderService.verify(editId, setVerify, user.id);
  };

  function formatMapAddress(formData) {
    return `${formData.address1 || ""} ${formData.address2 || ""} ${
      formData.city || ""
    }, ${formData.state || ""} ${formData.zip || ""}`;
  }

  const geocode = async (formData) => {
    const result = await esriService.geocode(formatMapAddress(formData));
    setGeocodeResults(result);
  };

  const noteTooltip = (
    <div>
      <Typography>{`IF YOU GET THROUGH TO THEM:`}</Typography>
      <List dense={true}>
        <ListItem>
          <ListItemText
            primary={`COVID Updates: (i.e., different hours, fewer days, low on staff)`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Perishable or nonperishable food (or both)`}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Prepared food (Y/N)`} />
        </ListItem>
      </List>
    </div>
  );

  const adminNoteTooltip = (
    <div>
      <List dense={true}>
        <ListItem>
          <ListItemText
            primary={`FOLA liason name, number, and email: (someone from organization who responds to requests for future updates)`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Distribute food to the public or to other food pantries?`}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Donor contact (name, phone, email)`} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Organization Information
        </Typography>
        <Formik
          initialValues={originalData}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting, setFieldValue }) => {
            if (values.id) {
              return stakeholderService
                .put({ ...values, loginId: user.id })
                .then((response) => {
                  setToast({
                    message: "Update successful.",
                  });
                  history.push("/");
                })
                .catch((err) => {
                  setToast({
                    message: "Update failed.",
                  });
                  console.log(err);
                  setSubmitting(false);
                });
            } else {
              return stakeholderService
                .post({ ...values, loginId: user.id })
                .then((response) => {
                  setToast({
                    message: "Insert successful.",
                  });
                  setFieldValue("id", response.id);
                  history.push("/");
                })
                .catch((err) => {
                  setToast({
                    message: "Insert failed.",
                  });
                  console.log(err);
                  setSubmitting(false);
                });
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <TextField
                    type="text"
                    label="Name"
                    name="name"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    autoFocus
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.name ? errors.name : ""}
                    error={touched.name && Boolean(errors.name)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl className={classes.formControl}>
                    <InputLabel
                      style={{ color: "red" }}
                      id="selectCategoryIds-label"
                    >
                      Categories
                    </InputLabel>

                    <Select
                      labelId="selectCategoryIds-label"
                      id="selectedCategoryIds"
                      variant="outlined"
                      name="selectedCategoryIds"
                      multiple
                      fullWidth
                      value={values.selectedCategoryIds}
                      onChange={handleChange}
                      input={<Input />}
                      renderValue={(selectedCategoryIds) => {
                        if (!categories) {
                          return "Loading categories...";
                        }
                        if (selectedCategoryIds.length === 0) {
                          return "(Select Categories)";
                        }
                        return selectedCategoryIds
                          .map(
                            (categoryId) =>
                              categories.filter(
                                (category) => category.id === categoryId
                              )[0].name
                          )
                          .join(", ");
                      }}
                      MenuProps={MenuProps}
                    >
                      {categories.map((category) => (
                        <MenuItem
                          key={category.id}
                          value={category.id}
                          // style={getStyles(name, personName, theme)}
                        >
                          <Checkbox
                            checked={
                              values.selectedCategoryIds.indexOf(category.id) >
                              -1
                            }
                          />
                          <ListItemText primary={category.name} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.selectedCategoryIds
                        ? errors.selectedCategoryIds
                        : ""}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <BigTooltip title="The organization is not operating">
                    <FormControlLabel
                      control={
                        <Checkbox
                          margin="normal"
                          name="inactive"
                          label="Inactive"
                          value={values.inactive}
                          checked={values.inactive}
                          onChange={() =>
                            setFieldValue("inactive", !values.inactive)
                          }
                          onBlur={handleBlur}
                        />
                      }
                      label="Inactive"
                    />
                  </BigTooltip>
                </Grid>

                <Grid item xs={12}>
                  <BigTooltip title="Leave Blank">
                    <TextField
                      type="text"
                      label="Description"
                      placeholder="Leave blank"
                      name="description"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      multiline
                      rows={2}
                      rowsMax={12}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.description ? errors.description : ""}
                      error={touched.description && Boolean(errors.description)}
                    />
                  </BigTooltip>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    type="text"
                    label="Parent Organization"
                    name="parentOrganization"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    value={values.parentOrganization}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={
                      touched.parentOrganization
                        ? errors.parentOrganization
                        : ""
                    }
                    error={
                      touched.parentOrganization &&
                      Boolean(errors.parentOrganization)
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="address1"
                    label="Address Line 1"
                    type="text"
                    value={values.address1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.address1 ? errors.address1 : ""}
                    error={touched.address1 && Boolean(errors.address1)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="address2"
                    label="Address Line 2"
                    type="text"
                    value={values.address2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.address2 ? errors.address2 : ""}
                    error={touched.address2 && Boolean(errors.address2)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="city"
                    label="City"
                    type="text"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.city ? errors.city : ""}
                    error={touched.city && Boolean(errors.city)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="state"
                    label="State"
                    type="text"
                    value={values.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.state ? errors.state : ""}
                    error={touched.state && Boolean(errors.state)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="zip"
                    label="Zip Code"
                    type="text"
                    value={values.zip}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.zip ? errors.zip : ""}
                    error={touched.zip && Boolean(errors.zip)}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="latitude"
                    label="Latitude"
                    type="text"
                    value={values.latitude}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.latitude ? errors.latitude : ""}
                    error={touched.latitude && Boolean(errors.latitude)}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="longitude"
                    label="Longitude"
                    type="text"
                    value={values.longitude}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.longitude ? errors.longitude : ""}
                    error={touched.longitude && Boolean(errors.longitude)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container justifycontent={"space-between"}>
                    <Grid item>
                      <SearchButton
                        onClick={() => {
                          (geocodeResults && geocodeResults.length) < 1
                            ? geocode(values)
                            : setGeocodeResults([]);
                        }}
                        label={
                          (geocodeResults && geocodeResults.length) < 1
                            ? "Get Coordinates"
                            : "Close"
                        }
                        style={{ marginTop: "1.2em" }}
                      />
                    </Grid>
                  </Grid>
                  <div style={{ padding: "0.5em 0" }}>
                    {geocodeResults ? (
                      geocodeResults.map((result, index) => (
                        <div
                          style={{
                            border: "1px solid black",
                            backgroundColor: "#EEE",
                            margin: "0.1em",
                            padding: "0.5em",
                          }}
                          key={index}
                        >
                          <Grid container>
                            <Grid item xs={10}>
                              <Typography>{`(${result.location.y}, ${result.location.x})`}</Typography>
                              <Typography>{`${result.attributes.Match_addr}`}</Typography>
                              <Typography>{`${result.attributes.Addr_type}`}</Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <VerifyButton
                                label=""
                                onClick={() => {
                                  setFieldValue("latitude", result.location.y);
                                  setFieldValue("longitude", result.location.x);
                                  setGeocodeResults([]);
                                }}
                              />
                            </Grid>
                          </Grid>
                        </div>
                      ))
                    ) : (
                      <div>No Results</div>
                    )}
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <OpenTimeForm
                    name="hours"
                    onChange={handleChange}
                    value={values.hours}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="phone"
                    label="Phone"
                    type="text"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.phone ? errors.phone : ""}
                    error={touched.phone && Boolean(errors.phone)}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="email"
                    label="Email"
                    type="text"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.email ? errors.email : ""}
                    error={touched.email && Boolean(errors.email)}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="facebook"
                    label="Facebook"
                    type="text"
                    value={values.facebook}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.facebook ? errors.facebook : ""}
                    error={touched.facebook && Boolean(errors.facebook)}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="twitter"
                    label="Twitter"
                    type="text"
                    value={values.twitter}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.twitter ? errors.twitter : ""}
                    error={touched.twitter && Boolean(errors.twitter)}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="pinterest"
                    label="Pinterest"
                    type="text"
                    value={values.pinterest}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.pinterest ? errors.pinterest : ""}
                    error={touched.pinterest && Boolean(errors.pinterest)}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="linkedin"
                    label="LinkedIn"
                    type="text"
                    value={values.linkedin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.linkedin ? errors.linkedin : ""}
                    error={touched.linkedin && Boolean(errors.linkedin)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="website"
                    label="Web Site"
                    type="text"
                    value={values.website}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={touched.website ? errors.website : ""}
                    error={touched.website && Boolean(errors.website)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <BigTooltip title="(Items besides food, i.e. dog food, cat food, hygiene products, diapers, female hygiene products)">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="items"
                      label="Items (separated by commas)"
                      type="text"
                      value={values.items}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.items ? errors.items : ""}
                      error={touched.items && Boolean(errors.items)}
                    />
                  </BigTooltip>
                </Grid>
                <Grid item xs={12}>
                  <BigTooltip title="(Besides feeding ppl, i.e., family counseling, career counseling, drop in for women or homeless, etc.)">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="services"
                      label="Services (separated by commas)"
                      type="text"
                      value={values.services}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.services ? errors.services : ""}
                      error={touched.services && Boolean(errors.services)}
                    />
                  </BigTooltip>
                </Grid>
                <Grid item xs={12}>
                  <BigTooltip title="(In addition, must go to chapel service, must be < 18, must show citizenship, etc.)">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="requirements"
                      label="Eligibility / Requirements"
                      type="text"
                      multiline
                      rows={2}
                      rowsMax={12}
                      value={values.requirements}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={
                        touched.requirements ? errors.requirements : ""
                      }
                      error={
                        touched.requirements && Boolean(errors.requirements)
                      }
                    />
                  </BigTooltip>
                </Grid>
                <Grid item xs={12}>
                  <BigTooltip title={noteTooltip}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="notes"
                      label="Public Notes"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      type="text"
                      multiline
                      rows={2}
                      rowsMax={12}
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.notes ? errors.notes : ""}
                      error={touched.notes && Boolean(errors.notes)}
                    />
                  </BigTooltip>
                </Grid>

                <Grid item xs={12}>
                  <BigTooltip title={adminNoteTooltip}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      name="adminNotes"
                      label="Internal Notes"
                      type="text"
                      multiline
                      rows={2}
                      rowsMax={12}
                      value={values.adminNotes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.adminNotes ? errors.adminNotes : ""}
                      error={touched.adminNotes && Boolean(errors.adminNotes)}
                    />
                  </BigTooltip>
                </Grid>

                <Grid
                  item
                  xs={12}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <VerifyButton
                    type="button"
                    onClick={() => {
                      const setVerified = !!!values.verifiedDate;
                      verify(setVerified);
                      setFieldValue(
                        "verifiedDate",
                        setVerified ? moment().format() : ""
                      );
                      setFieldValue(
                        "verifiedUser",
                        setVerified ? user.firstName + " " + user.lastName : ""
                      );
                    }}
                    disabled={!values.id}
                    label={values.verifiedDate ? "Unverify" : "Verify"}
                  />
                  <div>
                    {/* <CloseButton type="button" onClick={cancel} /> */}
                    <SaveButton
                      type="submit"
                      className={classes.submit}
                      disabled={isSubmitting}
                      style={{ marginLeft: "0.5em" }}
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    style={{
                      border: "1px solid gray",
                      borderRadius: "4px",
                      padding: "0.5em",
                    }}
                  >
                    <div>Id: {values.id} </div>
                    <div>
                      {`Entered: ${values.createdUser} ${
                        values.createdDate
                          ? moment(values.createdDate).format(
                              "MM/DD/YY hh:mm a"
                            )
                          : ""
                      }`}
                    </div>
                    <div>
                      {`Last Modified: ${values.modifiedUser} ${
                        values.modifiedDate
                          ? moment(values.modifiedDate).format(
                              "MM/DD/YY hh:mm a"
                            )
                          : ""
                      }`}
                    </div>
                    <div>
                      {`Verified: ${values.verifiedUser} ${
                        values.verifiedDate
                          ? moment(values.verifiedDate).format(
                              "MM/DD/YY hh:mm a"
                            )
                          : ""
                      }`}
                    </div>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </div>
    </Container>
  );
};

export default withStyles(styles)(withRouter(StakeholderEdit));
