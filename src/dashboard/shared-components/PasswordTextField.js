import TextField from "@material-ui/core/TextField";
import {IconButton, InputAdornment} from "@material-ui/core";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import React, {useState} from "react";

const PasswordTextField = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <TextField
            type={showPassword ? "text" : "password"}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword} >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                )
            }}
            {...props}
        />
    )
}

export default PasswordTextField;