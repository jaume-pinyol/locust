class RunnersCollector(object):
    def __init__(self, runners, options):
        self.runners = runners
        self.selected_runner = runners.keys()[0]

    def select_runner(self, runner):
        self.selected_runner = runner

    def get_runner(self, runner):
        if runner in self.runners:
            return self.runners[runner]