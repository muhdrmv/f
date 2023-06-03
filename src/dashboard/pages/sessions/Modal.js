import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {IconButton, CardMedia } from "@material-ui/core";
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import {gql, useMutation} from "@apollo/client";
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp';

const ACTION_SESS_LIVE = gql`
    mutation ($sessionId: String!) {
        action_sess_live(sessionId: $sessionId) {
            tunnel_id
        }
    }
`;

function getModalStyle() {
    return {
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: '90vw',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5]
    },
    liveIcon: {
        cursor: 'pointer', 
        transform: 'scale(1.8)',
        position: 'absolute', 
        top:0, 
        right:-10, 
        zIndex:30, 
        borderRadius: '100%', 
        backgroundColor: '#fff'
    },
    cardMediaStyle : {
        height: '95vh', 
        with:'100vw'
    }
}));


export default function SimpleModal({sessionId}) {

    const [sessLive,] = useMutation(ACTION_SESS_LIVE);

    const handleClickLive = async (id) => {

        try {
            const result = await sessLive({variables: {sessionId: id}});
            // const windowOpen = window.open( process.env.REACT_APP_TUNNEL_URL + "/#/?key="+result?.data?.action_sess_live?.tunnel_id, '_blank');
            return process.env.REACT_APP_TUNNEL_URL + "/#/?key="+result?.data?.action_sess_live?.tunnel_id    
        } catch (error) {
            alert(error);
        }
    }

    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);
    const [url, setUrl] = React.useState('');

    const handleOpen = async () => {
        let urlResult = await handleClickLive(sessionId);
        setUrl(urlResult)
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const modalBody = (
        <div style={modalStyle} className={classes.paper}>
            <HighlightOffSharpIcon onClick={handleClose} className={classes.liveIcon} />
            <CardMedia src={url} component='iframe' className={classes.cardMediaStyle} />
        </div>
    );

    return (
        <>
            <IconButton title="Live" onClick={handleOpen}
                    color="primary"
                    aria-label="view">
                <DesktopWindowsIcon fontSize="small"/>
            </IconButton>
        
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {modalBody}
            </Modal>
        </>
    );
}