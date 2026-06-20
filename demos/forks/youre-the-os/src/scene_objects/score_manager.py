from constants import ONE_SECOND
from engine.scene_object import SceneObject
from scene_objects.views.score_manager_view import ScoreManagerView

_UPDATE_INTERVAL = 100


class ScoreManager(SceneObject):

    def __init__(self, stage):
        self._process_manager = stage.process_manager
        self._worldline_store = stage.worldline_store

        self._score = 0
        self._last_update_time = 0
        self._gracefully_terminated_process_count = 0
        self._user_terminated_process_count = 0
        self._wasted_io_action_count = 0

        super().__init__(ScoreManagerView(self))

    @property
    def score(self):
        return int(self._score)

    def update(self, current_time, events):
        if current_time - self._last_update_time >= _UPDATE_INTERVAL:
            self._last_update_time = current_time
            stats = self._process_manager.get_current_stats()

            points_per_second = 0

            points_per_second += stats['alive_process_count_by_starvation_level'][0] * 100
            points_per_second += stats['active_process_count'] * 50
            points_per_second -= stats['active_process_count_by_starvation_level'][0] * 50
            points_per_second -= stats['blocked_active_process_count'] * 50
            points_per_second -= stats['io_event_count'] * 20

            points = points_per_second / (ONE_SECOND / _UPDATE_INTERVAL)
            self._score = max(self._score + points, 0)

            if stats['io_wasted_action_count'] != self._wasted_io_action_count:
                wasted_actions = stats['io_wasted_action_count'] - self._wasted_io_action_count
                self._wasted_io_action_count = stats['io_wasted_action_count']
                self._score = max(0, self._score - 50 * wasted_actions)
            else:
                wasted_actions = 0

            if stats['user_terminated_process_count'] != self._user_terminated_process_count:
                user_terminated_processes = (
                    stats['user_terminated_process_count'] - self._user_terminated_process_count
                )
                self._user_terminated_process_count = stats['user_terminated_process_count']
                self._score = max(0, self._score - 1000)
            else:
                user_terminated_processes = 0
            if (
                stats['gracefully_terminated_process_count'] !=
                self._gracefully_terminated_process_count
            ):
                gracefully_terminated_processes = (
                    stats['gracefully_terminated_process_count'] -
                    self._gracefully_terminated_process_count
                )
                self._gracefully_terminated_process_count = stats[
                    'gracefully_terminated_process_count'
                ]
                self._score += 1000
            else:
                gracefully_terminated_processes = 0

            self._worldline_store.record_score_tick(
                score=self.score,
                graceful_delta=gracefully_terminated_processes,
                user_delta=user_terminated_processes,
                wasted_io_delta=wasted_actions,
            )
