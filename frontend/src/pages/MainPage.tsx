import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { OpenDirectory } from "../../wailsjs/go/main/App";
import { InitialSnycDirectoryListPage } from "../../wailsjs/go/initial/Initial";
import { models } from "../../wailsjs/go/models";
import { EventsOn } from "../../wailsjs/runtime/runtime"

import DirectoryList from "../components/directory/DirectoryList";
import Loading from "../components/common/Loading";
import { SendDirectoryContent } from "../../wailsjs/go/tcpserver/TCPServer";

export interface RenameFileData {
  key: string;
  depth: number;
  files: models.File[];
}

const MainPage = () => {
	const navigate = useNavigate()
  
  const [isLoading ,setIsLoading] = useState<boolean>(true)
  const [resFileData, setResFileData] = useState<RenameFileData[]>()
  const [connectedClientFileData, setConnectedClientFileData] = useState<RenameFileData[]>()
  const [rootPath, setRootPath] = useState<string>("")

  EventsOn("server_shutdown", function() {
    navigate("/connect")
  })

  // 폴더 정보를 상대 PC로 부터 받아오면 
  //  로딩 종료
  //  정보를 변수로 저장
  EventsOn("connectedDirectoryData", async (data: models.ResponseFileStruct) => {
    setConnectedClientFileData(() => {
      return renameFile(data)
    })
    setIsLoading(() => false)
  })

  useEffect(() => {
    InitialSnycDirectoryListPage()
    FetchFileData()
  }, []);

  // 서버로부터 파일 정보와, 선택 된 폴더 경로를 받아옴
	const FetchFileData = async (): Promise<void> => {
		try {
			const res = await OpenDirectory();

			if (res.root_path.length == 0 || !res.root_path) {
				FetchFileData()
				return
			}

      setResFileData(() => renameFile(res))
      setRootPath(() => res.root_path)

      // 선택한 폴더의 내용을 상대 PC에게 보내줌
      await SendDirectoryContent(res)
		} catch (error) {
			console.error("Error fetching data:", error);
			FetchFileData()
		}
	}

  // 이 함수는 주어진 파일 데이터를 가공하여 경로를 수정하고, 각 파일의 깊이를 계산한 후 이 정보를 배열로 정리하여 반환합니다.
  // 반환된 데이터는 RenameFileData 형식의 배열입니다.
  const renameFile = (fileData: models.ResponseFileStruct): RenameFileData[] => {
    let renameFileData: RenameFileData[] = []
    for (const path_key in fileData.files) {
      let renameKey = path_key.replace(fileData.root_path, "")
      
      renameKey = renameKey.replace(/\\/g, '/')

      if (renameKey.startsWith("/")) {
        renameKey = renameKey.slice(1)
      }

      renameFileData.push({
        key: renameKey == "" ? path_key : renameKey,
        depth: renameKey == "" ? 0: renameKey.split("/").length,
        // @ts-ignore
        files: fileData.files[path_key],
      })
    }
    return renameFileData
  }

  return (
    <Fragment>
      { isLoading ? 
      <Loading />
      :
      <div className="main">
        {resFileData && rootPath && <DirectoryList resFileData={resFileData} type='server' root_path={rootPath} />}
        {connectedClientFileData && <DirectoryList resFileData={connectedClientFileData} type='conn' root_path=""/>}
      </div>
      }
    </Fragment>
  )
}

export default MainPage