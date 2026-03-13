pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = 'PlentyWahala/my-node-api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    env.SHORT_SHA = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.BUILD_TAG_NAME = "build-${env.BUILD_NUMBER}"
                    env.SHA_TAG_NAME = "sha-${env.SHORT_SHA}"

                    sh """
                        docker build -t ${DOCKERHUB_REPO}:${BUILD_TAG_NAME} .
                        docker tag ${DOCKERHUB_REPO}:${BUILD_TAG_NAME} ${DOCKERHUB_REPO}:${SHA_TAG_NAME}
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                        docker push ${DOCKERHUB_REPO}:${BUILD_TAG_NAME}
                        docker push ${DOCKERHUB_REPO}:${SHA_TAG_NAME}
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pushed image tags: ${BUILD_TAG_NAME} and ${SHA_TAG_NAME}"
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
