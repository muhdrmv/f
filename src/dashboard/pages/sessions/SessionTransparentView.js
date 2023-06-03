import React, {useEffect, useRef, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Button, Grid, Paper, Tooltip} from '@material-ui/core';
import {useParams, useHistory} from "react-router-dom";
import {gql, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import 'date-fns';
import {changeTimeZone, formatBytes} from "../../../utilities/Utils";
import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import Movie from "@material-ui/icons/Movie";
import {Keyboard} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        '& h3': {
            margin: '3px 0',
            fontStyle: 'italic',
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
        padding: "1px",
        paddingLeft: "10px",
        textAlign: "left",
        paddingBottom: "10px",
    },

}));

const QUERY_SESSION = gql`
query ($id: uuid!) {
  sessions_by_pk(id: $id){
    id
    meta
    status
    created_at
    access_rule {
      name
    }
    connection {
      name
    }
    user {
      username
    }  
  }
  settings(where: {name: {_eq: "transparentIpAddress"}}) {
    value
  }
}
`;

const ACTION_TRANSPARENT_RENDER_VIDEO = gql`
mutation ($sessionId: uuid!) {
  action_transparent_render_video(sessionId: $sessionId) {
    result,
    message,
    link
  }
}
`;

const ACTION_TRANSPARENT_VIDEO_STATUS = gql`
mutation($sessionId: uuid!) {
  action_transparent_video_status (sessionId: $sessionId) {
    result,
    message,
    link
  }
}
`;

const ACTION_TRANSPARENT_KEYSTROKES = gql`
mutation($sessionId: uuid!) {
  action_transparent_keyStrokes (sessionId: $sessionId) {
    result,
    output
  }
}
`;


const SessionTransparentView = ({licenseInfo}) => {
    const {id} = useParams();
    const classes = useStyles();
    const history = useHistory();
    const [inProgress, setInProgress] = useState(false);
    const [session, setSession] = useState({});
    const [transparentIpAddress, setTransparentIpAdress] = useState(null)
    const [video, setVideo] = useState({});
    const [renderVideoEnabled, setRenderVideoEnabled] = useState(true);
    const [downloadVideoEnabled, setDownloadVideoEnabled] = useState(false);

    const [keystrokes, setKeystrokes] = useState('null');
    const [extractKeystrokesEnabled, setExtractKeystrokesEnabled] = useState(true);

    const intervalTimer = useRef();

    const {data, refetch} = useQuery(QUERY_SESSION, {variables: {id: id}});
    const [mutateTransparentSessionVideo,] = useMutation(ACTION_TRANSPARENT_RENDER_VIDEO);
    const [mutateSessionKeyStrokes,] = useMutation(ACTION_TRANSPARENT_KEYSTROKES);
    const [transparentVideoInfoQuery, ] = useMutation(ACTION_TRANSPARENT_VIDEO_STATUS);

    useEffect(() => {

        if(data?.settings){
            setTransparentIpAdress(data?.settings?.[0]?.value);
        }
        if (data?.sessions_by_pk) {
            const sessionData = data.sessions_by_pk;
            if(!sessionData?.meta?.transparentMode){
                history.push(`/dashboard/sessions-history/${id}/view`);
            }
            setSession(sessionData);
            setInProgress(false);
        } else {
            setInProgress(true);
        }
    }, [data]);

    const checkVideoTransparentStatus = async () => {
        const mutationResult = await transparentVideoInfoQuery({
            variables: {
                sessionId:id
            }
        });
        let res = mutationResult?.data?.action_transparent_video_status
        if(res?.result){
            setVideo({available: res?.result})
            if(res?.link){
                setVideo(s => ({...s, link: res?.link}));
                setRenderVideoEnabled(false);
                setDownloadVideoEnabled(true)
                console.log(res?.link);
            }else{
                console.log(res?.message);
                setDownloadVideoEnabled(false)
                setRenderVideoEnabled(false);
            }
        }else{
            setVideo({available: res?.result})
            console.log(res?.message);
            setRenderVideoEnabled(true);
        }
    };

    useEffect(() => {
        checkVideoTransparentStatus();
        intervalTimer.current = setInterval(handleClickRefresh, 10000);
        return () => {
            clearInterval(intervalTimer.current)
        }
    }, []);

    const handleClickExtractKeystrokes = async () => {
        
        setExtractKeystrokesEnabled(false);
        const sessionData = data?.sessions_by_pk;
        if(sessionData?.status == 'ready' || sessionData?.status == 'initializing' ){
            alert("The session has not started!");
            return;
        }

        const mutationResult = await mutateSessionKeyStrokes({
            variables: {
                sessionId:id
            }
        });
        if(mutationResult?.data?.action_transparent_keyStrokes?.result){
            setKeystrokes({result: true, output: mutationResult?.data?.action_transparent_keyStrokes?.output})
        }else{
            setKeystrokes({result: false, output: mutationResult?.data?.action_transparent_keyStrokes?.output})
            console.log(mutationResult?.data?.action_transparent_keyStrokes?.message);
        }
    }

    const handleClickRenderVideo = async () => {
        if (window.confirm('Are you sure you want to start rendering this session?')) {
            const sessionData = data?.sessions_by_pk;
            if(sessionData?.status == 'ready' || sessionData?.status == 'initializing' ){
                alert("The session has not started!");
                return;
            }
            setRenderVideoEnabled(false);
            const mutationResult = await mutateTransparentSessionVideo({
                variables: {
                    sessionId:id
                }
            });
            if(mutationResult?.data?.action_transparent_render_video?.result){
                setRenderVideoEnabled(false);
            }else{
                alert(mutationResult?.data?.action_transparent_render_video?.message)
                setRenderVideoEnabled(true);
            }
        }
    }

    const handleClickDownloadVideo = async () => {
        const recUrl = `${transparentIpAddress}:3001/session/v/${id}`;
        window.open(recUrl);
    }

    const handleClickRefresh = () => {
        refetch();
        checkVideoTransparentStatus()
    }

    const ExtraIcons = () => (
        <>
            <Tooltip title="Refresh">
                <IconButton aria-label="refresh" onClick={handleClickRefresh}>
                    <RefreshIcon/>
                </IconButton>
            </Tooltip>
        </>
    );

    let videoStatus = '';
    if (video?.available)
        videoStatus = 'Available';
    if (!video?.available)
        videoStatus = 'Not Available';
    

   

    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>
                <TopToolbar toolbarTitle={"Session Details"} backLinkUrl="/dashboard/sessions-history"
                            inProgress={inProgress} extraIcons={ExtraIcons}/>

                <div className={classes.root} style={{padding: "20px"}}>
                    <Grid container spacing={3}>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Username</h3>
                                <span>
                                    {session?.user?.username}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Connection Name</h3>
                                <span>
                                    {session?.connection?.name}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Access Rule Name</h3>
                                <span>
                                    {session?.access_rule?.name}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Session Status</h3>
                                <span>
                                    {session?.status}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Session Started at</h3>
                                <span>
                                    {session?.meta?.liveAt ? changeTimeZone(session?.meta?.liveAt) : changeTimeZone(session?.created_at)}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper className={classes.paper}><h3>Session Closed at</h3>
                                <span>
                                    {session?.meta?.closedAt ? changeTimeZone(session?.meta?.closedAt) : 'N/A'}
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper className={classes.paper}><h3>Session Unique ID</h3>
                                <span>
                                    {session?.id}
                                </span>
                            </Paper>
                        </Grid>

                    </Grid>
                </div>

                <h4>
                    Video Details
                </h4>
                <div className={classes.root} style={{padding: "20px"}}>
                    <Grid container spacing={3}>

                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Video Status</h3>
                                <span>{videoStatus}</span>
                            </Paper>
                        </Grid>
                        <Grid item xs={8}>
                            <Paper className={classes.paper}><h3>Download Video</h3>
                                <span>
                                    <Button size="small" color="primary"
                                            startIcon={<Movie/>}
                                            onClick={handleClickRenderVideo}
                                            disabled={!renderVideoEnabled}>
                                        Render Video
                                    </Button>
                                    &nbsp; &nbsp; &nbsp;
                                    <Button size="small" color="primary"
                                            startIcon={<Movie/>}
                                            onClick={handleClickDownloadVideo}
                                            disabled={!downloadVideoEnabled}>
                                        Download Video
                                    </Button>
                                </span>
                            </Paper>
                        </Grid>

                    </Grid>
                </div>

                <h4>
                    Keystrokes Details
                </h4>
                <div className={classes.root} style={{padding: "20px"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Paper className={classes.paper}><h3>Render Keystrokes</h3>
                                <span>
                                    <Button size="small" color="primary"
                                            startIcon={<Keyboard/>}
                                            onClick={handleClickExtractKeystrokes}
                                            disabled={!extractKeystrokesEnabled}
                                    >
                                        Render Keystrokes
                                    </Button>
                                </span>
                            </Paper>
                        </Grid>
                        {keystrokes &&
                            <Grid item xs={6}>
                                <Paper className={classes.paper}><h3>Keystrokes Output:</h3>
                                    <p style={{whiteSpace: 'pre-wrap'}}>{keystrokes?.output}</p>
                                </Paper>
                            </Grid>
                        }
                    </Grid>
                </div>
            </Paper>
        </div>


    )
}

export default SessionTransparentView