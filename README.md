# Stream your rtsp stream on web browsers

## Setting the project on local Machine.
  1. Cloning the git repo
  ```
  git clone git@github.com:codespirit7/rtsp-streaming.git
  ```

  2. Change the directory to rtsp-streaming
  ```
  cd rtsp-streaming
  ```

  3. Starting the server

  ### spinning the flask server
  ```
  cd my-env

  #acivate the virtual environment
  source "/path-to-present-working-directory/bin/activate"

  #Now you will see (my-env) before the cmd path, stating you have activated the virtual environment

  # inntalling all the dependecies
  pip install -r requirements.txt

  # One more last thing , you have to create a "streamOutput" folder
  mkdir streamOutput

  #start the server
  python3 app.py

  ```

