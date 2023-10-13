import React, { useEffect, useState } from 'react';
import jpgExifReader from 'exif-reader';
import { Toaster, toast } from 'sonner';
import { decode } from '@stevebel/png';

function App() {

  const [image, setImage] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [imageB64, setImageB64] = useState('');
  const [result, setResult] = useState('暂无结果');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.utools.onPluginEnter(({code, type, payload, option}) => {
      window.utools.setExpendHeight(270)
      if (type === 'img') {
        setImageB64(payload)
        setImagePath('')
      } else if (type === 'regex') {
        setImageB64('')
        setImagePath(payload)
        console.log(payload)
      } else if (type === 'files' && payload[0].isFile) {
        setImagePath(payload[0].path)
        setImageB64('')
      }
    })
  }, []);

  useEffect(() => {
    toast.dismiss()
  }, [result])

  useEffect(() => {
    (async () => {
      setIsSuccess(false)
      if (imagePath === '' && imageB64 === '') {
        return
      }
      toast.loading('处理中......', { duration: 100000000, dismissible: false })
      let imageBuffer;
      if (imagePath !== '') {
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          imageBuffer = await window.downloadImage(imagePath)
        } else {
          imageBuffer = window.readFile(imagePath)
        }
      } else if (imageB64 !== '') {
        imageBuffer = window.b64ToBuffer(imageB64)
      }
      if (!imageBuffer) {
        setResult('未能读取到图片')
        return
      }
      const fileType = window.isPngOrJpg(imageBuffer)
      if (fileType === '') {
        setImageB64('')
        setImagePath('')
        setResult('不支持的文件类型')
        return
      }
      setImage('data:image/png;base64,' + window.bufferToB64(imageBuffer))
      if (fileType === 'png') {
        const metadata = decode(imageBuffer)
        if (metadata.internationalText && metadata.internationalText.parameters && metadata.internationalText.parameters.text) {
          setResult(metadata.internationalText.parameters.text)
          setIsSuccess(true)
          return
        }
        if (metadata.text && metadata.text.parameters) {
          setResult(metadata.text.parameters)
          setIsSuccess(true)
          return
        }
      } else {
        const metadata = jpgExifReader(window.getJpegExifBuffer(imageBuffer))
        if (metadata && metadata.Photo && metadata.Photo.UserComment) {
          setResult(metadata.Photo.UserComment.toString().replace('UNICODE', '').replaceAll('\x00', ''))
          setIsSuccess(true)
          return
        }
      }
      setResult('图片中未能找到生成参数信息')
    })()
  }, [imagePath, imageB64])

  const handleImagePick = async (e) => {
    const result = await window.utools.showOpenDialog({ 
      filters: [{ extensions: ['png', 'jpg', 'jpeg'] }], 
      properties: ['openFile'] 
    })
    if (result === undefined || result === null) {
      return
    }
    setImagePath(result[0])
  }

  const handleCopy = () => {
    window.utools.copyText(result)
    toast.success('已复制')
  }

  return (
    <>
      <Toaster position="top-center" richColors duration={1500} expand visibleToasts={1} />
      <div className="flex h-[200px]">
        
        {/* 左侧上传区域 */}
        <div className="w-1/2 p-4 h-[200px]" onClick={handleImagePick}>
          <label
            className="flex flex-col items-center justify-center w-full h-full bg-white border-2 border-blue-400 border-dashed rounded-lg cursor-pointer hover:bg-blue-50"
            htmlFor="dropzone-file" 
          >
            <div className="flex flex-col items-center justify-center px-4 pt-5 pb-6 max-h-full max-w-full">

              {image === '' && <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold text-blue-500">点击选择图片</span>
                </p>

                <p className="text-xs text-gray-500">
                  PNG, JPG
                </p>
              </> }
              {image !== '' && <img src={image} alt="preview" className="max-h-full max-w-full" />}
            </div>

          </label>
        </div>

        {/* 右侧结果区域 */}
        <div className="w-1/2 p-4 h-[200px]">
          <div className="border border-blue-400 rounded-md h-full">
            <div className="p-4 h-full overflow-y-auto flex justify-center text-gray-700 word-break-all">
              { result }
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <button
          disabled={!isSuccess}
          onClick={handleCopy}
          className="w-full h-12 px-6 text-white transition-colors duration-150 bg-green-600 rounded-lg focus:shadow-outline hover:bg-green-800 disabled:bg-stone-400">
            复制参数
        </button>
      </div>
    </>
  );
}

export default App;
