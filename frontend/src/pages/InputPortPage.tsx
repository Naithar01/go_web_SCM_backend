import { Fragment, useEffect, useState } from "react"

import { InitialInputPortPage } from "../../wailsjs/go/initial/Initial"
import { SetServerPort } from "../../wailsjs/go/tcpserver/TCPServer"

import Alert from "../components/common/Alert"

import "../styles/pages/input_port_page_style.css" 
import { useNavigate } from "react-router-dom"

const InputPortPage = () => {
  const navigate = useNavigate()
  const [portState, setPortState] = useState<number>()

  useEffect(() => {
    InitialInputPortPage() 
  }, [])

  const ChangePortStateHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const enteredPort: number = +e.target.value;
  
    if (!Number.isNaN(enteredPort)) setPortState(() => enteredPort);
  }

  const ConnectServerHandler = async (): Promise<void> => {
    if (!portState) {
      return
    }

    const serverListeningState: boolean = await SetServerPort(portState)

    // 서버 실행 실패 시에...
    if (!serverListeningState) {
      return 
    }

    navigate("/dir")
    
  }  

  return (
    <Fragment>
      <div className="input_port_page">
        <Alert text="Enter the PORT for opening the TCP server" />
        <div className="input_port_page_port_inp_areas">
          <div className="input_port_page_port_inp_area">
            <input type="text" inputMode="numeric" value={portState} placeholder="Enter Server Port" onChange={ChangePortStateHandler}/>
          </div>
          <div className="input_port_page_port_inp_area">
            <button type="button" onClick={ConnectServerHandler}>Start Server</button>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default InputPortPage