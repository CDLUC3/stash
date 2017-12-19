require_dependency 'stash_api/application_controller'

module StashApi
  class FilesController < ApplicationController

    before_action only: [:index] { require_resource_id(resource_id: params[:version_id]) }
    before_action only: [:show] { require_file_id(file_id: params[:id]) }

    # get /files/<id>
    def show
      file = StashApi::File.new(file_id: params[:id])
      respond_to do |format|
        format.json { render json: file.metadata }
        format.html { render text: UNACCEPTABLE_MSG, status: 406 }
      end
    end

    # get /versions/<version-id>/files
    def index
      files = paged_files_for_version
      respond_to do |format|
        format.json { render json: files }
        format.html { render text: UNACCEPTABLE_MSG, status: 406 }
      end
    end

    private

    def paged_files_for_version
      resource = StashEngine::Resource.find(params[:version_id]) # version_id is really resource_id
      visible = resource.file_uploads.present_files
      all_count = visible.count
      file_uploads = visible.limit(page_size).offset(page_size * (page - 1))
      results_count = file_uploads.count
      results = file_uploads.map { |i| StashApi::File.new(file_id: i.id).metadata }
      {
        '_links' => paging_hash(result_count: all_count),
        count: results_count,
        total: all_count,
        '_embedded' => { 'stash:files' => results }
      }
    end
  end
end