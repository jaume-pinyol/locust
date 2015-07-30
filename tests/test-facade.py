from locust import HttpLocust, TaskSet, task

class GetImagesBehavior(TaskSet):
    @task(1)
    def get_image(self):
        response = self.client.get("http://ec2-52-18-65-220.eu-west-1.compute.amazonaws.com:8000/ads")

class WebsiteUser(HttpLocust):
    task_set = GetImagesBehavior
    min_wait = 5000
    max_wait = 9000
