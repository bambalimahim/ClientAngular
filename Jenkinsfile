pipeline {
  agent any
  choice(name: 'mode', choices:['dev', 'prod'], description: 'mode deployement')
  stages {
    stage('build') {
      steps {
        echo 'build en cours ...'
      }
    }
  }
}
