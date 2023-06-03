import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import { Grid, Paper, Snackbar} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {gql, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from "../../shared-components/BottomToolbar";
import AssessmentIcon from '@material-ui/icons/Assessment';

const useStyles = makeStyles((theme) => ({
     root: {
         '& .MuiTextField-root': {
             marginTop: theme.spacing(2),
             marginBottom: theme.spacing(2),
         },
     },
     form: {
         padding: theme.spacing(2),
     },
     paper: {
         width: '100%',
         marginBottom: theme.spacing(1),
     },
 
 }));
 

const SET_SYSTEM_SETTINGS = gql`
mutation ($name: String!, $value: String!) {

  delete_settings (where: {_and: [
    {type: {_eq: "system"}},
    {name: {_eq: $name}}
  ]}) {
    affected_rows
  }  
  
  insert_settings_one(object: {
      type: "system", 
      name: $name, 
      value: $value, 
  }) {
    id
  }
}
`;


const QUERY_SYSTEM_SETTINGS = gql`
query {
settings(where: {name: {_eq: "user-behavior-analytics"}}) {
    value
  }
}
`;


const UBA = () => {
     const allActivity = [
          {
               id: "login-failed",
               title: "Login Failed",
               description: "The number of failed logins for each user is higher than the previous days and the normal state"
          },
          {
               id: "suspicious-logins",
               title: "Suspicious Logins",
               description: "Monitor users' device and IP when logging in and suspicious cases"
          },
          {
               id: "suspicious-ticket",
               title: "Suspicious Ticket",
               description: "Monitoring of users who suddenly have more tickets than usual after a long time."
          },
          {
               id: "poor-password",
               title: "Poor Password",
               description: "Monitoring of users whose passwords are very weak"
          },
          {
               id: "suspicious-failed-session",
               title: "Suspicious Failed Session",
               description: "Monitoring of users who fail to login to their servers"
          }
     ]

     const classes = useStyles();
     const [inProgress, setInProgress] = React.useState(false);
     const [snackbarState, setSnackbarState] = useState({isOpen: false,message: ''});
     const [abnormalTags, setAbormalTags] = useState([]);
     const [abnormalActivity, setAbnormalActivity] = useState([]);
     const [setSystemSetting,] = useMutation(SET_SYSTEM_SETTINGS);
     const {loading, error, data} = useQuery(QUERY_SYSTEM_SETTINGS);
     
     useEffect( () => {
          let selectedAbnormalActivity = data?.settings?.[0]?.value
          if(selectedAbnormalActivity){
               let tags = [];
               let arr = JSON.parse(selectedAbnormalActivity)
               setAbnormalActivity(arr)
               arr.forEach( element => {
                    tags.push(element?.id)
               });
               setAbormalTags(tags)
          }
     }, [data])

     const handleChangeAbnormalTags = (e, v) => {
          const selectedIds = v.map(i=>i.id);
          setAbormalTags(selectedIds)
          setAbnormalActivity(v)
     }


     const handleFormSubmit = async e => {
          setInProgress(true);
          try {
               
              await setSystemSetting({
                  variables: {
                      name: 'user-behavior-analytics',
                      value: JSON.stringify(abnormalActivity),
                  }
              });
              setSnackbarState({message: 'Successful', isOpen: true})
              setTimeout(() => {
                  setSnackbarState(s => ({...s, isOpen: false}));
              }, 1000);
          } catch (e) {
              console.log(e)
              alert('Data access error');
          }
          setInProgress(false);
     };





     return ( 
          <div className={classes.root} style={{width: '100%'}}>
               <Paper className={classes.paper}>

                    <TopToolbar toolbarTitle={"User Behaviour Analytics"}  toolbarIcon={<AssessmentIcon style={{margin: '-4px 8px'}}/>}
                                   onClickDone={handleFormSubmit} inProgress={inProgress}/>

                    <div className={classes.root}>
                         <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                         <Grid container spacing={3}>
                              
                              <Grid item xs={12}>
                                   <CheckboxesTags id="users" label="Abnormal Activity" placeholder="Add Abnormal Activity" items={allActivity} fullWidth
                                        onChange={handleChangeAbnormalTags} selectedIds={abnormalTags} />
                              </Grid>

                              <Grid item xs={12}>
                                   {
                                        abnormalActivity.map( (a) => (
                                             <p style={{fontSize: "medium"}}> <span style={{fontWeight: "bold"}}>{a?.title} : </span>{a?.description}</p>

                                        ))
                                   }
                              </Grid>

                              <BottomToolbar backLinkUrl="/dashboard/users" onClickDone={handleFormSubmit}
                                             inProgress={inProgress} />
                         </Grid>
                         </form>
                    </div>
               </Paper>

               <Snackbar
               open={snackbarState.isOpen}
               // onClose={handleSnackbarClose}
               // TransitionComponent={(<Slide direction="up" />)}
               message={snackbarState.message}
               // key={SlideTransition.name}
               />
          </div>
     );
}
 
export default UBA;