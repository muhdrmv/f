import React from 'react';
import JalaliUtils from "@date-io/jalaali";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {IconButton} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";

const JalaliDatePicker = (props) => {
    const onClear = () => { props.onChange(null); };
    let inputProps = {};
    if (props.value) {
        inputProps = {
            startAdornment: (
                <IconButton onClick={(e) => {e.stopPropagation(); onClear();}} style={{order: 1}}>
                    <CancelIcon color="disabled" fontSize="small" />
                </IconButton>
            )
        }
    }
    return (
        <MuiPickersUtilsProvider utils={JalaliUtils}>
            <DatePicker
                inputVariant="outlined"
                autoOk
                fullWidth
                disableToolbar
                variant="inline"
                // format="dd-mm-yyyy"
                format="jYYYY-jMM-jDD"
                margin="normal"
                InputProps={inputProps}
                InputAdornmentProps={{
                    position: "end",
                    style: {order: 2, marginLeft: 0}
                }}
                {...props}
            />
        </MuiPickersUtilsProvider>
    );
};

export default JalaliDatePicker;