from worldline import WorldlineStore


def test_default_briefing_marks_fresh_soul(tmp_path):
    store = WorldlineStore(tmp_path / 'worldline.json')

    assert store.briefing_lines() == [
        'WORLDLINE',
        'Fresh soul',
        'Scheduling style unknown',
    ]


def test_records_score_and_process_outcomes(tmp_path):
    store = WorldlineStore(tmp_path / 'worldline.json')

    store.record_score_tick(score=1250, graceful_delta=1, user_delta=0, wasted_io_delta=0)
    store.record_score_tick(score=900, graceful_delta=0, user_delta=1, wasted_io_delta=2)

    state = store.snapshot()
    assert state['canon']['bestOsScore'] == 1250
    assert state['canon']['schedulerDiscipline'] == 8
    assert state['canon']['panicIndex'] == 11
    assert [event['type'] for event in state['events']] == [
        'os.process_completed',
        'os.process_terminated',
        'os.io_wasted',
    ]


def test_records_run_end_and_changes_briefing(tmp_path):
    store = WorldlineStore(tmp_path / 'worldline.json')

    store.record_run_end(stage_name='Difficulty: NORMAL', score=2400, outcome='defeat')

    state = store.snapshot()
    assert state['canon']['runs'] == 1
    assert state['canon']['bestOsScore'] == 2400
    assert state['events'][0]['type'] == 'os.run_ended'
    assert store.briefing_lines() == [
        'WORLDLINE',
        'OS runs 1 / Best 2400',
        'Profile: still calibrating',
    ]
