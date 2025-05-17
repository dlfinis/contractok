// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ContratoOK {
    string public message = "ContratoOK activo";
    
    function setMessage(string calldata _msg) external {
        message = _msg;
    }
}
