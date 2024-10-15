# Getting start

## running development
1. install dependencies `npm install`
2. edit you `.env` file
3. run development server `npm start`

## deploy to firebase
1. install firebase `nopm install firebase`
2. login with firebase cli `firebase login`
3. init firebase if u didn't `firebase init` now only initial the `hosting`, this step when they asks y/N press N to all *DONT OVERWRITE*
4. build webapp into build folder `npm run build`
5. ensure you are in the right path `firebase use development`
6. deploy to firebase hosting `firebase deploy`