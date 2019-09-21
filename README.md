## visual for RTSP stream and mqtt message
RTSP stream only support by IE11.

* modify camera ip addr in public/rtsp.html
<param name='mrl' value='rtsp://192.168.1.164:554'/>

* modify atlas ip addr in src/components/Visual/index.jsx 
url: 'http://192.168.1.111:3001',

## usage
npm install -g create-react-app  
yarn  
yarn build  
yarn start  


## use docker
docker build -t tf-inference-visual -f Dockerfile .  
docker run -d --net host tf-inference-visual

