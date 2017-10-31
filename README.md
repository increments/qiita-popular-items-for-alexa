# qiita-popular-articles-for-alexa

Generating Qiita Popular Items Feed for Alexa Flash Briefing Skill

## How to use

This application uses [AWS Serverless Application Model (AWS SAM)](https://github.com/awslabs/serverless-application-model).

### Preparation

- Create S3 bucket to put a feed.

### Execute locally

To execute locally, you can use [SAM local](http://docs.aws.amazon.com/lambda/latest/dg/test-sam-local.html).

Edit env.json and set these environment variables,

- `DESTINATION_S3_BUCKET`: S3 bucket name for uploading a feed
- `DESTINATION_S3_KEY`: S3 object key
- `DESTINATION_S3_REGION`: AWS region location of a bucket using

Then run `sam local invoke` command.

```
echo "{}" | sam local invoke PushFeedFunction --template samTemplate.yaml --env-vars env.json
```

### Deploy to AWS

This application supports automated deployment using CloudFormation, CodeBuild and CodePipeline.
Take a look this document and build your pipeline.

- [Automating Deployment of Lambda-based Applications - AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/automating-deployment.html)

